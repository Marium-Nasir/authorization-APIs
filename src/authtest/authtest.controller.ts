/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AuthtestService } from './authtest.service';
import { SignUpDto } from 'src/auth/dto/signup.dto';

@Controller('authtest')
export class AuthtestController {
  constructor(private readonly authTestService: AuthtestService) {}

  @Post('sign-up')
  async signClient(@Body() data: SignUpDto, @Res() res): Promise<any> {
    const response: any = await this.authTestService.signUp(data);
    console.log(response + ' response');
    
    console.log(response.status + " from controller");
    
    res.status(response.status).json(response);
  }

  @Get('verify-link/:token')
  async verifyClient(@Param('token') token: string, @Res() res): Promise<any> {
    // console.log('token ', token);
    const response: any = await this.authTestService.verifyLink(token);
    res.status(response.status).json(response);
  }

  @Post('resend-email')
  async resendEmail(@Body() data, @Res() res): Promise<any> {
    const email = data.email;
    const response: any = await this.authTestService.resendEmail(email);
    res.status(response.status).json(response);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data, @Res() res): Promise<any> {
    const email = data.email;
    const response: any = await this.authTestService.forgotPassword(email);
    res.status(response.status).json(response);
  }

  @Post('set-password')
  async setResetPassword(@Body() data, @Res() res): Promise<any> {
    const response: any = await this.authTestService.setPassword(data);
    res.status(response.status).json(response);
  }

  @Post('login-user')
  async login(@Body() data, @Res() res): Promise<any> {
      const response: any = await this.authTestService.loginUser(data);
      res.status(response.status).json(response);
  }
}
