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
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Availability } from '../../availabilities/entities/availability.entity';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, (p) => p.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Index()
  @Column({ type: 'uuid' })
  doctorId!: string;

  @ManyToOne(() => Doctor, (d) => d.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;

  @Column({ type: 'uuid', nullable: true })
  availabilityId!: string | null;

  @OneToOne(() => Availability, (a) => a.appointment, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'availabilityId' })
  availability!: Availability | null;

  @Index()
  @Column({ type: 'date' })
  appointmentDate!: string;

  @Column({ type: 'time' })
  appointmentTime!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({
    type: 'varchar',
    default: AppointmentStatus.PENDING,
  })
  status!: AppointmentStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
