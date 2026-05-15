import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  CurrentUser,
  JwtUserPayload,
} from '../common/decorators/current-user.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get('me')
  myAppointments(@CurrentUser() u: JwtUserPayload) {
    return this.appointments.findForUser(u.sub, u.role as Role);
  }

  @Get('me/upcoming')
  @Roles(Role.PATIENT)
  upcoming(@CurrentUser() u: JwtUserPayload) {
    return this.appointments.upcomingForPatientUser(u.sub);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointments.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointments.findOne(id);
  }

  @Roles(Role.PATIENT)
  @Post()
  book(
    @CurrentUser() u: JwtUserPayload,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointments.book(u.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointments.update(id, dto, {
      userId: u.sub,
      role: u.role as Role,
    });
  }

  @Delete(':id')
  cancel(
    @CurrentUser() u: JwtUserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointments.cancel(id, {
      userId: u.sub,
      role: u.role as Role,
    });
  }
}
