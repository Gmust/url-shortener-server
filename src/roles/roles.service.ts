import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class RolesService {

  constructor(private userService: UsersService) {
  }

  public async changeRole({ newRole, _id }: ChangeRoleDto) {
    const user = await this.userService.findUser({ _id });
    if (!user) {
      throw new BadRequestException('Invalid user id');
    }

    user.role = newRole;
    user.save();

    const updatedUser = await this.userService.findUser({ _id });

    return {
      message: 'User role successfully changed!',
      updatedUser
    };
  }


}
