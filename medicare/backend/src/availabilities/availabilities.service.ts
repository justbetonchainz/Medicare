import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AvailabilityStatus } from '../common/enums/availability-status.enum';

@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectRepository(Availability)
    private readonly slots: Repository<Availability>,
    @InjectRepository(Doctor)
    private readonly doctors: Repository<Doctor>,
  ) {}

  async findForDoctorUser(userId: string): Promise<Availability[]> {
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return this.findForDoctor(doctor.id);
  }

  async findForDoctor(
    doctorId: string,
    onlyAvailable = false,
  ): Promise<Availability[]> {
    const where: { doctorId: string; status?: AvailabilityStatus } = { doctorId };
    if (onlyAvailable) where.status = AvailabilityStatus.AVAILABLE;
    return this.slots.find({
      where,
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Availability> {
    const a = await this.slots.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Availability not found');
    return a;
  }

  async createForDoctorUser(
    userId: string,
    dto: CreateAvailabilityDto,
  ): Promise<Availability> {
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    return this.create(doctor.id, dto);
  }

  async create(
    doctorId: string,
    dto: CreateAvailabilityDto,
  ): Promise<Availability> {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
    const conflict = await this.slots.findOne({
      where: { doctorId, date: dto.date, startTime: dto.startTime },
    });
    if (conflict) throw new ConflictException('Slot already exists');

    const slot = this.slots.create({
      doctorId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: AvailabilityStatus.AVAILABLE,
    });
    return this.slots.save(slot);
  }

  async updateForDoctorUser(
    userId: string,
    id: string,
    dto: UpdateAvailabilityDto,
  ): Promise<Availability> {
    const slot = await this.findOne(id);
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor || slot.doctorId !== doctor.id) {
      throw new ForbiddenException('Cannot modify another doctor\'s slot');
    }
    if (slot.status === AvailabilityStatus.BOOKED) {
      throw new ConflictException('Cannot modify a booked slot');
    }
    await this.slots.update(id, dto);
    return this.findOne(id);
  }

  async removeForDoctorUser(userId: string, id: string): Promise<void> {
    const slot = await this.findOne(id);
    const doctor = await this.doctors.findOne({ where: { userId } });
    if (!doctor || slot.doctorId !== doctor.id) {
      throw new ForbiddenException('Cannot delete another doctor\'s slot');
    }
    if (slot.status === AvailabilityStatus.BOOKED) {
      throw new ConflictException('Cannot delete a booked slot');
    }
    await this.slots.delete(id);
  }
}
