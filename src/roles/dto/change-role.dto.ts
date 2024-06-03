import { IsEnum, IsNotEmpty } from 'class-validator';

import { RolesEnum } from '../../types/User';

export class ChangeRoleDto {

  @IsNotEmpty()
  @IsEnum(RolesEnum)
  newRole: RolesEnum;

  @IsNotEmpty()
  _id: string;

}
