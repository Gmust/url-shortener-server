import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post } from '@nestjs/common';

import { ErrorMessages } from '../utils/strings';
import { AuthService } from './auth.service';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
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

  @Post('sign-in')
  @HttpCode(HttpStatus.CREATED)
  async signIn(@Body() signInDto: SignInDto) {
    try {
      return this.authService.signIn(signInDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

  @Post('confirm-registration')
  @HttpCode(HttpStatus.OK)
  async confirmRegistration(@Body() confirmRegistrationDto: ConfirmRegistrationDto) {
    try {
      return this.authService.confirmAccountRegistration(confirmRegistrationDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.CREATED)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return this.authService.refreshToken(refreshTokenDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

  @Get('get-user-by-token')
  @HttpCode(HttpStatus.OK)
  async getUserByToken(@Body() { token }: { token: string }) {
    try {
      return this.authService.getUserByToken(token);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      return this.authService.forgotPassword(forgotPasswordDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.ACCEPTED)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      return this.authService.resetPassword(resetPasswordDto);
    } catch (e) {
      throw new InternalServerErrorException(e, ErrorMessages.SmthWentWrong);
    }
  }

}
