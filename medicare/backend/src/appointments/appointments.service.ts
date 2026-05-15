import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Not, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Availability } from '../availabilities/entities/availability.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { AvailabilityStatus } from '../common/enums/availability-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointments: Repository<Appointment>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Doctor) private readonly doctors: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilities: Repository<Availability>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QueryAppointmentDto): Promise<Appointment[]> {
    const qb = this.appointments
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'p')
      .leftJoinAndSelect('p.user', 'pu')
      .leftJoinAndSelect('a.doctor', 'd')
      .leftJoinAndSelect('d.user', 'du')
      .leftJoinAndSelect('d.specialty', 's')
      .orderBy('a.appointmentDate', 'DESC')
      .addOrderBy('a.appointmentTime', 'DESC');

    if (query.doctorId) qb.andWhere('a.doctorId = :did', { did: query.doctorId });
    if (query.patientId) qb.andWhere('a.patientId = :pid', { pid: query.patientId });
    if (query.status) qb.andWhere('a.status = :st', { st: query.status });
    if (query.from) qb.andWhere('a.appointmentDate >= :from', { from: query.from });
    if (query.to) qb.andWhere('a.appointmentDate <= :to', { to: query.to });

    return qb.getMany();
  }

  async findOne(id: string): Promise<Appointment> {
    const a = await this.appointments.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true, specialty: true },
        availability: true,
      },
    });
    if (!a) throw new NotFoundException('Appointment not found');
    return a;
  }

  async findForUser(userId: string, role: Role): Promise<Appointment[]> {
    if (role === Role.PATIENT) {
      const patient = await this.patients.findOne({ where: { userId } });
      if (!patient) throw new NotFoundException('Patient profile not found');
      return this.findAll({ patientId: patient.id });
    }
    if (role === Role.DOCTOR) {
      const doctor = await this.doctors.findOne({ where: { userId } });
      if (!doctor) throw new NotFoundException('Doctor profile not found');
      return this.findAll({ doctorId: doctor.id });
    }
    return this.findAll({});
  }

  async book(userId: string, dto: CreateAppointmentDto): Promise<Appointment> {
    const patient = await this.patients.findOne({ where: { userId } });
    if (!patient) throw new ForbiddenException('Only patients can book');

    return this.dataSource.transaction(async (mgr) => {
      const slot = await mgr.findOne(Availability, {
        where: { id: dto.availabilityId },
      });
      if (!slot) throw new NotFoundException('Slot not found');
      if (slot.status !== AvailabilityStatus.AVAILABLE) {
        throw new ConflictException('Slot already booked');
      }

      // Check for an active (non-cancelled) appointment at the same slot
      const conflict = await mgr.findOne(Appointment, {
        where: {
          doctorId: slot.doctorId,
          appointmentDate: slot.date,
          appointmentTime: slot.startTime,
          status: Not(AppointmentStatus.CANCELLED),
        },
      });
      if (conflict) {
        throw new ConflictException('Doctor already has an appointment at this time');
      }

      const appt = mgr.create(Appointment, {
        patientId: patient.id,
        doctorId: slot.doctorId,
        availabilityId: slot.id,
        appointmentDate: slot.date,
        appointmentTime: slot.startTime,
        reason: dto.reason ?? null,
        status: AppointmentStatus.PENDING,
      });

      const saved = await mgr.save(appt);
      slot.status = AvailabilityStatus.BOOKED;
      await mgr.save(slot);
      return saved;
    });
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    actor: { userId: string; role: Role },
  ): Promise<Appointment> {
    const appt = await this.findOne(id);
    await this.assertAccess(appt, actor);

    if (dto.status && dto.status === AppointmentStatus.CANCELLED) {
      return this.cancel(id, actor);
    }

    if (dto.availabilityId && dto.availabilityId !== appt.availabilityId) {
      return this.dataSource.transaction(async (mgr) => {
        const newSlot = await mgr.findOne(Availability, {
          where: { id: dto.availabilityId! },
        });
        if (!newSlot) throw new NotFoundException('New slot not found');
        if (newSlot.status !== AvailabilityStatus.AVAILABLE) {
          throw new ConflictException('Target slot already booked');
        }
        if (newSlot.doctorId !== appt.doctorId) {
          throw new BadRequestException('Cannot change doctor via reschedule');
        }

        if (appt.availabilityId) {
          await mgr.update(Availability, appt.availabilityId, {
            status: AvailabilityStatus.AVAILABLE,
          });
        }
        newSlot.status = AvailabilityStatus.BOOKED;
        await mgr.save(newSlot);

        await mgr.update(Appointment, id, {
          availabilityId: newSlot.id,
          appointmentDate: newSlot.date,
          appointmentTime: newSlot.startTime,
          reason: dto.reason ?? appt.reason,
          status: dto.status ?? appt.status,
        });
        return mgr.findOneOrFail(Appointment, { where: { id } });
      });
    }

    await this.appointments.update(id, {
      reason: dto.reason ?? appt.reason,
      status: dto.status ?? appt.status,
    });
    return this.findOne(id);
  }

  async cancel(
    id: string,
    actor: { userId: string; role: Role },
  ): Promise<Appointment> {
    const appt = await this.findOne(id);
    await this.assertAccess(appt, actor);
    if (appt.status === AppointmentStatus.CANCELLED) return appt;

    return this.dataSource.transaction(async (mgr) => {
      await mgr.update(Appointment, id, {
        status: AppointmentStatus.CANCELLED,
        availabilityId: null,
      });
      if (appt.availabilityId) {
        await mgr.update(Availability, appt.availabilityId, {
          status: AvailabilityStatus.AVAILABLE,
        });
      }
      return mgr.findOneOrFail(Appointment, { where: { id } });
    });
  }

  async todayCountForDoctorUser(userId: string): Promise<number> {
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor) return 0;
    const today = new Date().toISOString().slice(0, 10);
    return this.appointments.count({
      where: { doctorId: doctor.id, appointmentDate: today },
    });
  }

  async upcomingForPatientUser(userId: string): Promise<Appointment[]> {
    const patient = await this.patients.findOne({ where: { userId } });
    if (!patient) return [];
    const today = new Date().toISOString().slice(0, 10);
    return this.appointments.find({
      where: {
        patientId: patient.id,
        appointmentDate: Between(today, '9999-12-31'),
      },
      relations: { doctor: { user: true, specialty: true } },
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  private async assertAccess(
    appt: Appointment,
    actor: { userId: string; role: Role },
  ): Promise<void> {
    if (actor.role === Role.ADMIN) return;
    if (actor.role === Role.PATIENT) {
      const patient = await this.patients.findOne({
        where: { userId: actor.userId },
      });
      if (!patient || patient.id !== appt.patientId) {
        throw new ForbiddenException('Not your appointment');
      }
      return;
    }
    if (actor.role === Role.DOCTOR) {
      const doctor = await this.doctors.findOne({
        where: { userId: actor.userId },
      });
      if (!doctor || doctor.id !== appt.doctorId) {
        throw new ForbiddenException('Not your appointment');
      }
    }
  }
}
