import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { QueryDoctorDto } from './dto/query-doctor.dto';
import { Role } from '../common/enums/role.enum';
import { DoctorStatus } from '../common/enums/doctor-status.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private readonly doctors: Repository<Doctor>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QueryDoctorDto): Promise<Doctor[]> {
    const qb = this.doctors
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.user', 'u')
      .leftJoinAndSelect('d.specialty', 's')
      .orderBy('u.lastName', 'ASC');

    if (query.specialtyId) {
      qb.andWhere('d.specialtyId = :sid', { sid: query.specialtyId });
    }
    if (query.search) {
      qb.andWhere(
        '(LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q OR LOWER(s.name) LIKE :q)',
        { q: `%${query.search.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Doctor> {
    const d = await this.doctors.findOne({
      where: { id },
      relations: { user: true, specialty: true },
    });
    if (!d) throw new NotFoundException('Doctor not found');
    return d;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const d = await this.doctors.findOne({
      where: { userId },
      relations: { user: true, specialty: true },
    });
    if (!d) throw new NotFoundException('Doctor profile not found');
    return d;
  }

  async create(dto: CreateDoctorDto): Promise<Doctor> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already used');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.dataSource.transaction(async (mgr) => {
      const user = mgr.create(User, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        passwordHash,
        role: Role.DOCTOR,
      });
      const savedUser = await mgr.save(user);

      const doctor = mgr.create(Doctor, {
        userId: savedUser.id,
        specialtyId: dto.specialtyId,
        orderNumber: dto.orderNumber ?? null,
        bio: dto.bio ?? null,
        status: dto.status ?? DoctorStatus.ACTIVE,
      });
      const savedDoctor = await mgr.save(doctor);
      return mgr.findOneOrFail(Doctor, {
        where: { id: savedDoctor.id },
        relations: { user: true, specialty: true },
      });
    });
  }

  async update(id: string, dto: UpdateDoctorDto): Promise<Doctor> {
    await this.findOne(id);
    await this.doctors.update(id, dto);
    return this.findOne(id);
  }

  async updateByUserId(userId: string, dto: UpdateDoctorDto): Promise<Doctor> {
    const d = await this.findByUserId(userId);
    await this.doctors.update(d.id, dto);
    return this.findByUserId(userId);
  }

  async remove(id: string): Promise<void> {
    const d = await this.findOne(id);
    await this.users.delete(d.userId);
  }
}
