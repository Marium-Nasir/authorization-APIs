/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { GenerateTokenForLink } from 'src/authtest/helpingfunctions/genJWT';
import { MailService } from 'src/mail/mail.service';
import { ClientData } from './schemas/client.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { verifyEmailLinkTemplate } from 'src/mail/templates/verifywithlink';
import { forgotPasswordLinkTemplate } from 'src/mail/templates/forgotwithlink';
import { LogInDto } from 'src/auth/dto/login.dto';
import * as bcryptjs from 'bcryptjs';
import { validate } from 'class-validator';

@Injectable()
export class AuthtestService {
  constructor(
    @InjectModel(ClientData.name)
    private readonly clientModel: Model<ClientData>,
    private readonly mailService: MailService,
    private readonly genJWT: GenerateTokenForLink,
  ) {}

  async sendEmails(
    data,
    successStatus,
    failureStatus,
    link,
    template,
    dataVal,
  ): Promise<object> {
    const isSent = await this.mailService.sendEmail(data, link, template);

    if (isSent === 'success') {
      const res = {
        status: successStatus,
        message: 'Email Sent Successfully',
        data: dataVal,
      };
      return res;
    }
    if (isSent === 'error') {
      const res = {
        status: failureStatus,
        message: 'Email not sent Successfully',
        data: null,
      };
      return res;
    }
  }

  async generateLink(user) {
    const payload = { id: user._id };
    const time = 120;
    const token = await this.genJWT.genTokenForLink(payload, time);
    if (token) {
      // console.log(token + ' token');
      const link = `http://localhost:3000/authtest/verify-link/${token}`;

      return link;
    } else {
      const res = {
        status: 404,
        message: 'link not generated',
        data: null,
      };
      return res;
    }
  }

  async signUp(data: SignUpDto): Promise<object> {
    try {
      if (data.email === undefined || data.name === undefined) {
        const res = {
          status: 500,
          message: 'name or email missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const signUpData = new SignUpDto();
      signUpData.email = data.email;
      signUpData.name = data.name;
      const validationErrors = await validate(signUpData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.clientModel.findOne({ email: email });
        if (user) {
          if (user.password) {
            const res = {
              status: 400,
              message: 'Account already exists',
              data: null,
            };
            return res;
          } else {
            const link = await this.generateLink(user);
                if (typeof link === 'string') {
                   return await this.sendEmails(
                    data,
                    200,
                    400,
                    link,
                    verifyEmailLinkTemplate,
                    user,
                  );
                }
                else {
                  return link;
                }
          }
        }
        if (!user) {
          const newUser = await this.clientModel.create(data);
          if (newUser) {
            const link = await this.generateLink(newUser);
            if (typeof link === 'string') {
              return await this.sendEmails(
                data,
                201,
                400,
                link,
                verifyEmailLinkTemplate,
                newUser,
              );
            } else {
              return link;
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'User not created',
        data: err,
      };
      return res;
    }
  }

  async verifyLink(token: string): Promise<any> {
    try {
      if (!token || token === undefined) {
        const res = {
          status: 500,
          message: 'token is missing',
          data: null,
        };
        return res;
      }
      const verifiedToken = await this.genJWT.verifyToken(token);

      if (verifiedToken === false) {
        const res = {
          status: 500,
          message: 'Invalid or expired token',
          data: null,
        };
        return res;
      } else {
        const decodedToken = await this.genJWT.decodeToken(token);
        if (decodedToken != false) {
          const userId = decodedToken.id;
          const user = await this.clientModel.findOneAndUpdate(
            { _id: userId },
            { isVerified: true },
            { new: true },
          );
          if (!user) {
            const res = {
              status: 404,
              message: 'User not exists',
              data: null,
            };
            return res;
          } else {
            const res = {
              status: 200,
              message: 'Email verified',
              data: user,
            };
            return res;
          }
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'error during link verification',
        data: err,
      };
      return res;
    }
  }

  async resendEmail(email: string): Promise<any> {
    try {
      if (email === undefined) {
        const res = {
          status: 500,
          message: 'email is missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const signUpData = new SignUpDto();
      signUpData.email = email;
      const validationErrors = await validate(signUpData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.clientModel.findOne({ email: email });
        if (!user) {
          const res = {
            status: 404,
            message: 'User not found',
            data: null,
          };
          return res;
        }
        if (user.password) {
          const link = await this.generateLink(user);
          if (typeof link === 'string') {
            return await this.sendEmails(
              user,
              200,
              400,
              link,
              forgotPasswordLinkTemplate,
              user,
            );
          } else {
            return link;
          }
        } else {
          const link = await this.generateLink(user);
          if (typeof link === 'string') {
            return await this.sendEmails(
              user,
              200,
              400,
              link,
              verifyEmailLinkTemplate,
              user,
            );
          } else {
            return link;
          }
        }
      }
      // const user = await this.clientModel.findOne({ email });
      // const passwordExists = await this.clientModel.findOne({
      //   email: email,
      //   password: { $exists: true },
      // });
      // if (!user) {
      //   const res = {
      //     status: 404,
      //     message: 'user not exists',
      //     data: null,
      //   };
      //   return res;
      // } else {
      //   if (passwordExists != null) {
      //     const link = await this.generateLink(user);
      //     if (typeof link === 'string') {
      //       return await this.sendEmails(
      //         user,
      //         200,
      //         400,
      //         link,
      //         forgotPasswordLinkTemplate,
      //         user,
      //       );
      //     } else {
      //       return link;
      //     }
      //   } else {
      //     const link = await this.generateLink(user);
      //     if (typeof link === 'string') {
      //       return await this.sendEmails(
      //         user,
      //         200,
      //         400,
      //         link,
      //         verifyEmailLinkTemplate,
      //         user,
      //       );
      //     } else {
      //       return link;
      //     }
      //   }
      // }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'error during resend email',
        data: err,
      };
      return res;
    }
  }

  async setPassword(data: LogInDto): Promise<any> {
    try {
      if (data.email === undefined || data.password === undefined) {
        const res = {
          status: 500,
          message: 'email or password missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const password = data.password;
      const setPasswordData = new LogInDto();
      setPasswordData.email = data.email;
      setPasswordData.password = data.password;
      const validationErrors = await validate(setPasswordData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.clientModel.findOne({ email });
        if (!user) {
          const res = {
            status: 404,
            message: 'User not found',
            data: null,
          };
          return res;
        }
        if (user.isVerified === true) {
          const hashedPassword = await bcryptjs.hash(password, 10);
          const setPass = await this.clientModel.findOneAndUpdate(
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
      }
      // const user = await this.clientModel.findOne({ email });
      // if (user && user.isVerified === false) {
      //   const res = {
      //     status: 400,
      //     message: 'Please complete your registration',
      //     data: null,
      //   };
      //   return res;
      // }
      // if (!user) {
      //   const res = {
      //     status: 404,
      //     message: 'User not exists',
      //     data: null,
      //   };
      //   return res;
      // }
      // if (user && user.isVerified === true) {
      //   const hashedPassword = await bcryptjs.hash(password, 10);
      //   const updatePassword = await this.clientModel.findOneAndUpdate(
      //     { email },
      //     { password: hashedPassword },
      //     { new: true },
      //   );
      //   if (updatePassword) {
      //     const res = {
      //       status: 200,
      //       message: 'Password updated successfully',
      //       data: updatePassword,
      //     };
      //     return res;
      //   }
      // }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during set/reset password',
        data: err,
      };
      return res;
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      if (email === undefined) {
        const res = {
          status: 500,
          message: 'email is missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const signUpData = new SignUpDto();
      signUpData.email = email;
      const validationErrors = await validate(signUpData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const passwordExists = await this.clientModel.findOne({
          email: email,
          password: { $exists: true },
        });
        if (passwordExists === null) {
          const res = {
            status: 404,
            message: 'User not found',
            data: null,
          };
          return res;
        } else {
          const link = await this.generateLink(passwordExists);
          if (typeof link === 'string') {
            return await this.sendEmails(
              passwordExists,
              200,
              400,
              link,
              forgotPasswordLinkTemplate,
              passwordExists,
            );
          } else {
            return link;
          }
        }
      }
      // const passwordExists = await this.clientModel.findOne({
      //   email: email,
      //   password: { $exists: true },
      // });
      // // if (!user) {
      // //   const res = {
      // //     status: 404,
      // //     message: 'User not exists',
      // //     data: null,
      // //   };
      // //   return res;
      // // }
      // if (passwordExists != null) {
      //   const link = await this.generateLink(passwordExists);
      //   if (typeof link === 'string') {
      //     return await this.sendEmails(
      //       passwordExists,
      //       200,
      //       400,
      //       link,
      //       forgotPasswordLinkTemplate,
      //       passwordExists,
      //     );
      //   } else {
      //     return link;
      //   }
      // } else {
      //   const res = {
      //     status: 404,
      //     message: 'Please create your account',
      //     data: null,
      //   };
      //   return res;
      // }
    } catch (err) {
      const res = {
        status: 500,
        message: 'Error during forgot request',
        data: err,
      };
      return res;
    }
  }

  async loginUser(data: LogInDto): Promise<object> {
    try {
      if (data.email === undefined || data.password === undefined) {
        const res = {
          status: 500,
          message: 'email or password missing',
          data: null,
        };
        return res;
      }
      const email = data.email;
      const password = data.password;
      const setPasswordData = new SignUpDto();
      setPasswordData.email = email;
      const validationErrors = await validate(setPasswordData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const passwordExists = await this.clientModel.findOne({
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
        }
        if (passwordExists != null) {
          const pass = await bcryptjs.compare(
            password,
            passwordExists.password,
          );
          console.log(pass + ' from login');
          const payload = { id: passwordExists._id };
          const time = 7200;
          const token = await this.genJWT.genTokenForLink(payload, time);
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
      }
      // const user = await this.clientModel.findOne({ email });
      // const passwordExists = await this.clientModel.findOne({
      //   email: email,
      //   password: { $exists: true },
      // });
      // if (user && passwordExists === null) {
      //   const res = {
      //     status: 404,
      //     message: 'Please complete your registration',
      //     data: null,
      //   };
      //   return res;
      // }
      // if (passwordExists != null) {
      //   const pass = await bcryptjs.compare(password, user.password);
      //   console.log(pass + ' from login');
      //   const payload = { id: user._id };
      //   const time = 7200;
      //   const token = await this.genJWT.genTokenForLink(payload, time);
      //   if (pass) {
      //     const res = {
      //       status: 200,
      //       message: 'Sign-in Successfully',
      //       data: user,
      //       token,
      //     };
      //     return res;
      //   }
      //   if (!pass) {
      //     const res = {
      //       status: 400,
      //       message: 'Invalid Credentials',
      //       data: null,
      //     };
      //     return res;
      //   }
      // }
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
}
