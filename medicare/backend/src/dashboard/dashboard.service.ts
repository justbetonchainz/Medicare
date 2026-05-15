import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Specialty } from '../specialties/entities/specialty.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Role } from '../common/enums/role.enum';

export interface AdminStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  todayAppointments: number;
  perSpecialty: Array<{ specialtyId: string; name: string; doctors: number }>;
  recentAppointments: Appointment[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
    @InjectRepository(Doctor) private readonly doctors: Repository<Doctor>,
    @InjectRepository(Specialty)
    private readonly specialties: Repository<Specialty>,
    @InjectRepository(Appointment)
    private readonly appointments: Repository<Appointment>,
  ) {}

  async adminStats(): Promise<AdminStats> {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      perSpecialtyRaw,
      recentAppointments,
    ] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { role: Role.PATIENT } }),
      this.users.count({ where: { role: Role.DOCTOR } }),
      this.appointments.count(),
      this.appointments.count({ where: { appointmentDate: today } }),
      this.specialties
        .createQueryBuilder('s')
        .leftJoin('s.doctors', 'd')
        .select('s.id', 'specialtyId')
        .addSelect('s.name', 'name')
        .addSelect('COUNT(d.id)', 'doctors')
        .groupBy('s.id')
        .addGroupBy('s.name')
        .orderBy('s.name', 'ASC')
        .getRawMany<{ specialtyId: string; name: string; doctors: string }>(),
      this.appointments.find({
        order: { createdAt: 'DESC' },
        take: 10,
        relations: {
          patient: { user: true },
          doctor: { user: true, specialty: true },
        },
      }),
    ]);

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      perSpecialty: perSpecialtyRaw.map((r) => ({
        specialtyId: r.specialtyId,
        name: r.name,
        doctors: Number(r.doctors),
      })),
      recentAppointments,
    };
  }

  async doctorStats(userId: string): Promise<{
    todayAppointments: number;
    upcomingAppointments: number;
    totalAppointments: number;
  }> {
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor) {
      return {
        todayAppointments: 0,
        upcomingAppointments: 0,
        totalAppointments: 0,
      };
    }
    const today = new Date().toISOString().slice(0, 10);
    const [todayAppointments, upcomingAppointments, totalAppointments] =
      await Promise.all([
        this.appointments.count({
          where: { doctorId: doctor.id, appointmentDate: today },
        }),
        this.appointments
          .createQueryBuilder('a')
          .where('a.doctorId = :id', { id: doctor.id })
          .andWhere('a.appointmentDate >= :today', { today })
          .getCount(),
        this.appointments.count({ where: { doctorId: doctor.id } }),
      ]);
    return { todayAppointments, upcomingAppointments, totalAppointments };
  }
}
