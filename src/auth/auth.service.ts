/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { SignUpDto } from './dto/signup.dto';
import { GenerateToken } from './helpingFunctions/generateJWT';
import { UserData } from './Schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { verifyEmailTemplate } from 'src/mail/templates/verifyemail';
import { LogInDto } from './dto/login.dto';
import { forgotPasswordTemplate } from 'src/mail/templates/forgotpasswor';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserData.name)
    private readonly userModel: Model<UserData>,
    private readonly mailService: MailService,
    private readonly generateJWT: GenerateToken,
  ) {}

  async signUpUser(data: SignUpDto): Promise<object> {
    try {
      const email = data.email.toLowerCase();
      if(!data.email || !data.name) {
        const res = {
          status: 500,
          message: 'name or email missing',
          data: null,
        };
        return res;
      }
      const user = await this.userModel.findOne({ email: email });
      const passwordExists = await this.userModel.findOne({
        email: email,
        password: { $exists: true },
      });
      console.log(passwordExists + ' pass');

      if (passwordExists != null) {
        const res = {
          status: 400,
          message: 'Account already exists',
        };
        return res;
      }
      if (!user) {
        const newUser = await this.userModel.create(data);
        if (newUser) {
          // const otp = this.generateSixDigitCode();
          // const isSent = await this.mailService.sendEmail(
          //   data,
          //   otp,
          //   verifyEmailTemplate,
          // );
          // if (isSent === 'success') {
          //   const expirationTime = new Date();
          //   expirationTime.setMinutes(expirationTime.getMinutes() + 2);
          //   const userVal = await this.userModel.findOneAndUpdate(
          //     { email: email },
          //     { otpCode: { otp: otp, expiresIn: expirationTime } },
          //     { new: true },
          //   );
          //   if (userVal) {
          //     const res = {
          //       status: 201,
          //       message: 'Email Sent Successfully',
          //       data: userVal,
          //     };
          //     return res;
          //   } else {
          //     const res = {
          //       status: 400,
          //       message: 'Email not sent Successfully',
          //       data: null,
          //     };
          //     return res;
          //   }
          // }
          return await this.sendEmails(data, 201, 400, verifyEmailTemplate);
        }
      }
      if (user) {
        // const otp = this.generateSixDigitCode();
        // const isSent = await this.mailService.sendEmail(
        //   data,
        //   otp,
        //   verifyEmailTemplate,
        // );
        // if (isSent === 'success') {
        //   const expirationTime = new Date();
        //   expirationTime.setMinutes(expirationTime.getMinutes() + 2);
        //   const userVal = await this.userModel.findOneAndUpdate(
        //     { email: email },
        //     { otpCode: { otp: otp, expiresIn: expirationTime } },
        //     { new: true },
        //   );
        //   if (userVal) {
        //     const res = {
        //       status: 200,
        //       message: 'Email Sent Successfully',
        //       data: userVal,
        //     };
        //     return res;
        //   } else {
        //     const res = {
        //       status: 400,
        //       message: 'Email not sent Successfully',
        //       data: null,
        //     };
        //     return res;
        //   }
        // }
        return await this.sendEmails(data,200,400,verifyEmailTemplate);
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'failed to create user in db',
        data: err,
      };
      return res;
    }
  }

  async verifyOtp(email: string, otp: string): Promise<object> {
    try {
      if(!email || !otp) {
        const res = {
          status: 500,
          message: 'email or otp missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const user = await this.userModel.findOne({ email: email });

      if (!user) {
        const res = {
          status: 404,
          message: 'User not found',
          data: null,
        };
        return res;
      }

      const storedOtpData = user.otpCode;

      if (!storedOtpData || storedOtpData.otp !== otp) {
        const res = {
          status: 400,
          message: 'Invalid OTP',
          data: null,
        };
        return res;
      }

      const currentDateTime = new Date();
      const expirationTime = new Date(storedOtpData.expiresIn);

      if (currentDateTime > expirationTime) {
        const res = {
          status: 400,
          message: 'OTP has expired',
          data: null,
        };
        return res;
      } else {
        const isVerified = user.isVerified;
        if (isVerified === false) {
          await this.userModel.findOneAndUpdate(
            { email: email },
            { isVerified: true },
            { new: true },
          );
        }
        const res = {
          status: 200,
          message: 'email verified',
          data: null,
        };
        return res;
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during OTP verification',
        data: err,
      };
      return res;
    }
  }

  async resendOtp(email: string): Promise<object> {
    try {
      if(!email) {
        const res = {
          status: 500,
          message: 'email missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const user = await this.userModel.findOne({ email: email });
      const passwordExists = await this.userModel.findOne({
        email: email,
        password: { $exists: true },
      });
      console.log(user + ' user');
      
      if (!user) {
        const res = {
          status: 404,
          message: 'User not found',
          data: null,
        };
        return res;
      }
      
      if (passwordExists === null) {
        return await this.sendEmails(user,200,400,verifyEmailTemplate);
       }else{
        return await this.sendEmails(user,200,400,forgotPasswordTemplate);
       }
      // const otp = this.generateSixDigitCode();
      // const isSent = await this.mailService.sendEmail(
      //   user,
      //   otp,
      //   verifyEmailTemplate,
      // );

      // if (isSent === 'success') {
      //   const expirationTime = new Date();
      //   expirationTime.setMinutes(expirationTime.getMinutes() + 2);

      //   const updatedUser = await this.userModel.findOneAndUpdate(
      //     { email: email },
      //     { otpCode: { otp: otp, expiresIn: expirationTime } },
      //     { new: true },
      //   );

      //   if (updatedUser) {
      //     const res = {
      //       status: 200,
      //       message: 'OTP resent successfully',
      //       data: updatedUser,
      //     };
      //     return res;
      //   } else {
      //     const res = {
      //       status: 400,
      //       message: 'Failed to update OTP in the database',
      //       data: null,
      //     };
      //     return res;
      //   }
      // } 
      // else {
      //   const res = {
      //     status: 400,
      //     message: 'Failed to resend OTP via email',
      //     data: null,
      //   };
      //   return res;
      // }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during sending otp',
        data: err,
      };
      return res;
    }
  }

  async setPassword(data: LogInDto): Promise<object> {
    try {
      if(!data.email || !data.password) {
        const res = {
          status: 500,
          message: 'password or email missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const user = await this.userModel.findOne({ email });
      if (!user) {
        const res = {
          status: 404,
          message: 'User not found',
          data: null,
        };
        return res;
      }
      if (user.isVerified === true) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const setPass = await this.userModel.findOneAndUpdate(
          { email },
          { password: hashedPassword },
          { new: true },
        );
        if (setPass) {
          const res = {
            status: 200,
            message: 'Password set successfully',
            data: setPass,
          };
          return res;
        }
      } else {
        const res = {
          status: 400,
          message: 'Email not verified',
          data: null,
        };
        return res;
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during set password',
        data: err,
      };
      return res;
    }
  }

  async forgotPassword(email: string): Promise<object> {
    try {
      if(!email) {
        const res = {
          status: 500,
          message: 'email missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      // const user = await this.userModel.findOne({ email });
      const passwordExists = await this.userModel.findOne({
        email: email,
        password: { $exists: true },
      });
      if (passwordExists === null) {
        const res = {
          status: 404,
          message: 'Please create your account',
          data: null,
        };
        return res;
      } else {
        // if (user.isVerified === false || passwordExists === null) {
        //   const res = {
        //     status: 400,
        //     message: 'Please complete your registration',
        //     data: null,
        //   };
        //   return res;
        // }
        // const otp = this.generateSixDigitCode();
        // const isSent = await this.mailService.sendEmail(
        //   user,
        //   otp,
        //   forgotPasswordTemplate,
        // );
        // if (isSent === 'success') {
        //   const expirationTime = new Date();
        //   expirationTime.setMinutes(expirationTime.getMinutes() + 2);
        //   const userVal = await this.userModel.findOneAndUpdate(
        //     { email: email },
        //     { otpCode: { otp: otp, expiresIn: expirationTime } },
        //     { new: true },
        //   );
        //   if (userVal) {
        //     const res = {
        //       status: 200,
        //       message: 'Email Sent Successfully',
        //       data: userVal,
        //     };
        //     return res;
        //   } else {
        //     const res = {
        //       status: 400,
        //       message: 'Email not sent Successfully',
        //       data: null,
        //     };
        //     return res;
        //   }
        // }
        return await this.sendEmails(passwordExists,200,400,forgotPasswordTemplate);
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during send forgot password request',
        data: err,
      };
      return res;
    }
  }

  async loginUser(data: LogInDto): Promise<object> {
    try {
      const email = data.email.toLowerCase();
      const password = data.password;
      if(!data.email || !data.password) {
        const res = {
          status: 500,
          message: 'email or password missing',
          data: null,
        };
        return res;
      }
      // const user = await this.userModel.findOne({ email });
      const passwordExists = await this.userModel.findOne({
        email: email,
        password: { $exists: true },
      });
      if (passwordExists === null) {
        const res = {
          status: 404,
          message: 'Please register yourself',
          data: null,
        };
        return res;
      }
      if (passwordExists != null) {
        console.log(' from login');

        const pass = await bcrypt.compare(password, passwordExists.password);
        console.log(pass + ' from login');
        const payload = { id: passwordExists._id };
        const token = await this.generateJWT.genToken(payload);
        if (pass) {
          const res = {
            status: 200,
            message: 'Sign-in Successfully',
            data: passwordExists,
            token,
          };
          return res;
        }
        if (!pass) {
          const res = {
            status: 400,
            message: 'Invalid Credentials',
            data: null,
          };
          return res;
        }
      }
      // if (!user) {
      //   const res = {
      //     status: 400,
      //     message: 'Invalid Credentials',
      //     data: null,
      //   };
      //   return res;
      // }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during sign-in user',
        data: err,
      };
      return res;
    }
  }

  generateSixDigitCode(): string {
    const min = 100000;
    const max = 999999;
    const sixDigitCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return sixDigitCode.toString();
  }

  async sendEmails(
    data,
    successStatus,
    failureStatus,
    template,
  ): Promise<object> {
    const otp = this.generateSixDigitCode();
    const isSent = await this.mailService.sendEmail(data, otp, template);
    // console.log(isSent +' is sent');
    
    if (isSent === 'success') {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 2);
      const userVal = await this.userModel.findOneAndUpdate(
        { email: data.email },
        { otpCode: { otp: otp, expiresIn: expirationTime } },
        { new: true },
      );
      if (userVal) {
        const res = {
          status: successStatus,
          message: 'Email Sent Successfully',
          data: userVal,
        };
        return res;
      }
    } else {
      const res = {
        status: failureStatus,
        message: 'Email not sent Successfully',
        data: null,
      };
      return res;
    }
  }
}
