import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.dataSource.transaction(async (mgr) => {
      const user = mgr.create(User, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        passwordHash,
        role: dto.role,
      });
      const saved = await mgr.save(user);

      if (dto.role === Role.PATIENT) {
        await mgr.save(mgr.create(Patient, { userId: saved.id }));
      } else if (dto.role === Role.DOCTOR) {
        await mgr.save(mgr.create(Doctor, { userId: saved.id }));
      }

      return saved;
    });
  }

  findAll(role?: Role): Promise<User[]> {
    return this.users.find({
      where: role ? { role } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.users.findOne({
      where: { id },
      relations: { patient: true, doctor: { specialty: true } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    await this.users.update(id, dto);
    return this.findOne(id);
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    await this.findOne(id);
    await this.users.update(id, { isActive });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.users.delete(id);
    if (!result.affected) throw new NotFoundException('User not found');
  }
}
