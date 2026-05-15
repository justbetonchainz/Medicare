import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { DoctorStatus } from '../../common/enums/doctor-status.enum';
import { Availability } from '../../availabilities/entities/availability.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @OneToOne(() => User, (u) => u.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'uuid', nullable: true })
  specialtyId!: string | null;

  @ManyToOne(() => Specialty, (s) => s.doctors, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'specialtyId' })
  specialty!: Specialty | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  orderNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', default: DoctorStatus.ACTIVE })
  status!: DoctorStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Availability, (a) => a.doctor)
  availabilities?: Availability[];

  @OneToMany(() => Appointment, (a) => a.doctor)
  appointments?: Appointment[];
}
