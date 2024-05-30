import { Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post } from '@nestjs/common';

import { ErrorMessages } from '../utils/strings';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {
  }


  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return this.authService.signUp(signUpDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }


}
