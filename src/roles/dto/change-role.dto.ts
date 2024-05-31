import { IsEnum, IsNotEmpty } from 'class-validator';

import { Roles } from '../../types/User';

export class ChangeRoleDto {

  @IsNotEmpty()
  @IsEnum(Roles)
  newRole: Roles;

  @IsNotEmpty()
  _id: string;

}
