/* eslint-disable prettier/prettier */
import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly mailService: MailService, private readonly authService: AuthService) {}

  // @Post('test')
  // async testEmail(){
  //   return await this.mailService.sendEmail();
  // }

  @Post('signup')
  async signUp(@Body() data: SignUpDto): Promise<object> {
    return await this.authService.signUpUser(data);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data): Promise<object> {
    return await this.authService.forgotPassword(data.email);
  }

  @Post('login')
  async loginUser(@Body() data: LogInDto): Promise<object> {
    return await this.authService.loginUser(data);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data): Promise<object> {
    // console.log(data.email , data.otp + ' from verify otp ');
    return await this.authService.verifyOtp(data.email,data.otp);
  }

  @Post('set-password')
  async setPassword(@Body() data: LogInDto): Promise<object> {
    return await this.authService.setPassword(data);
  }

  @Post('resend-otp')
  async resendOtp(@Body() data): Promise<object> {
    return await this.authService.resendOtp(data.email);
  }
}
