/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  async sendEmail(data, otp, templateFn: Function) {
    const options = {
      to: data.email,
      from: 'mariumnasirse@gmail.com',
      subject: 'testing',
      html: templateFn(data.name, otp),
    };
     const email = await this.mailerService
      .sendMail(options)
      .then(() => {
        return 'success';
      })
      .catch((err) => {
        console.log(err);
        return 'error';
      });
      return email
  }
}
