import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from './users/entities/user.entity';
import { Patient } from './patients/entities/patient.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { Specialty } from './specialties/entities/specialty.entity';
import { Role } from './common/enums/role.enum';
import { DoctorStatus } from './common/enums/doctor-status.enum';

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const mgr = AppDataSource.manager;

  const specialtyData = [
    { name: 'General Medicine', description: 'Family / primary care' },
    { name: 'Cardiology', description: 'Heart specialists' },
    { name: 'Dermatology', description: 'Skin specialists' },
    { name: 'Pediatrics', description: 'Child health' },
    { name: 'Neurology', description: 'Nervous system' },
  ];
  const specialties: Specialty[] = [];
  for (const s of specialtyData) {
    const existing = await mgr.findOne(Specialty, { where: { name: s.name } });
    specialties.push(existing ?? (await mgr.save(mgr.create(Specialty, s))));
  }

  const adminEmail = 'admin@medrdv.local';
  const adminExisting = await mgr.findOne(User, { where: { email: adminEmail } });
  if (!adminExisting) {
    const admin = mgr.create(User, {
      firstName: 'Admin',
      lastName: 'Root',
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin1234', 10),
      role: Role.ADMIN,
    });
    await mgr.save(admin);
    // eslint-disable-next-line no-console
    console.log(`Created admin: ${adminEmail} / Admin1234`);
  }

  const docEmail = 'doctor@medrdv.local';
  const docExisting = await mgr.findOne(User, { where: { email: docEmail } });
  if (!docExisting) {
    const u = await mgr.save(
      mgr.create(User, {
        firstName: 'Sarah',
        lastName: 'Bennani',
        email: docEmail,
        passwordHash: await bcrypt.hash('Doctor1234', 10),
        role: Role.DOCTOR,
        phone: '+212600000001',
      }),
    );
    await mgr.save(
      mgr.create(Doctor, {
        userId: u.id,
        specialtyId: specialties[1].id,
        orderNumber: 'DR-001',
        bio: 'Experienced cardiologist.',
        status: DoctorStatus.ACTIVE,
      }),
    );
    // eslint-disable-next-line no-console
    console.log(`Created doctor: ${docEmail} / Doctor1234`);
  }

  const patEmail = 'patient@medrdv.local';
  const patExisting = await mgr.findOne(User, { where: { email: patEmail } });
  if (!patExisting) {
    const u = await mgr.save(
      mgr.create(User, {
        firstName: 'Karim',
        lastName: 'El Amrani',
        email: patEmail,
        passwordHash: await bcrypt.hash('Patient1234', 10),
        role: Role.PATIENT,
      }),
    );
    await mgr.save(
      mgr.create(Patient, {
        userId: u.id,
        address: 'Casablanca, Morocco',
      }),
    );
    // eslint-disable-next-line no-console
    console.log(`Created patient: ${patEmail} / Patient1234`);
  }

  await AppDataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Seed complete.');
}

seed().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
