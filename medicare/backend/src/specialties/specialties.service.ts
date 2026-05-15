import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from './entities/specialty.entity';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialties: Repository<Specialty>,
  ) {}

  findAll(): Promise<Specialty[]> {
    return this.specialties.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Specialty> {
    const sp = await this.specialties.findOne({ where: { id } });
    if (!sp) throw new NotFoundException('Specialty not found');
    return sp;
  }

  async create(dto: CreateSpecialtyDto): Promise<Specialty> {
    const exists = await this.specialties.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Specialty already exists');
    const sp = this.specialties.create(dto);
    return this.specialties.save(sp);
  }

  async update(id: string, dto: UpdateSpecialtyDto): Promise<Specialty> {
    await this.findOne(id);
    await this.specialties.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const r = await this.specialties.delete(id);
    if (!r.affected) throw new NotFoundException('Specialty not found');
  }
}
