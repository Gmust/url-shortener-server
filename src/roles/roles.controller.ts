import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guard/auth.guard';
import { Roles as RolesEnum } from '../types/User';
import { ErrorMessages } from '../utils/strings';
import { ChangeRoleDto } from './dto/change-role.dto';
import { RoleGuard } from './guard/role.guard';
import { Roles } from './roles.decorator';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {

  constructor(private rolesService: RolesService) {
  }

  @Roles(RolesEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('change')
  @HttpCode(HttpStatus.OK)
  changeRole(@Body() changeRoleDto: ChangeRoleDto) {
    try {
      return this.rolesService.changeRole(changeRoleDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong);
    }
  }

}
