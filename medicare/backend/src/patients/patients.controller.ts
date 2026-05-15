import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CurrentUser,
  JwtUserPayload,
} from '../common/decorators/current-user.decorator';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.patients.findAll();
  }

  @Roles(Role.PATIENT)
  @Get('me')
  me(@CurrentUser() u: JwtUserPayload) {
    return this.patients.findByUserId(u.sub);
  }

  @Roles(Role.PATIENT)
  @Patch('me')
  updateMe(
    @CurrentUser() u: JwtUserPayload,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patients.updateByUserId(u.sub, dto);
  }
}
