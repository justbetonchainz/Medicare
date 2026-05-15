import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { AvailabilityStatus } from '../../common/enums/availability-status.enum';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('availabilities')
@Index(['doctorId', 'date', 'startTime'], { unique: true })
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  doctorId!: string;

  @ManyToOne(() => Doctor, (d) => d.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'varchar', default: AvailabilityStatus.AVAILABLE })
  status!: AvailabilityStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Appointment, (a) => a.availability)
  appointment?: Appointment;
}
