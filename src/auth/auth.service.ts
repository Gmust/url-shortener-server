import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { User } from '../schemas/user.schema';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {
  }


  public async signIn({ password, email }: SignInDto) {

    const user = await this.userService.findUser({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isConfirmed != true) {
      throw new UnauthorizedException('Confirm your account before logging in');
    }

    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(user._id);

    return {
      user,
      access_token,
      refresh_token,
    };
  }

  private async generateAccessToken(user: User) {
    return this.jwtService.signAsync({ user }, { expiresIn: '15m', secret: jwtConstants.secret });
  }

  private async generateRefreshToken(userId: mongoose.Types.ObjectId) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '7d', secret: jwtConstants.secret });
  }

}
