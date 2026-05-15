import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private readonly patients: Repository<Patient>,
  ) {}

  findAll(): Promise<Patient[]> {
    return this.patients.find({ relations: { user: true } });
  }

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patients.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');
    return patient;
  }

  async updateByUserId(userId: string, dto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findByUserId(userId);
    await this.patients.update(patient.id, dto);
    return this.findByUserId(userId);
  }
}
