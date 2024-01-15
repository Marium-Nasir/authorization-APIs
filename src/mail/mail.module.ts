import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
// import { join } from 'path';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.host,
        port: 587,
        secure: false,
        auth: {
          user: process.env.UserEmail,
          pass: process.env.sendInBlueKey,
        },
      },
      // defaults: {
      //   from: '"No Reply" <noreply@example.com>',
      // },
      // template: {
      //   dir: join(__dirname, 'templates/verifyemail'),
      //   adapter: new HandlebarsAdapter(),
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
  ],
  // controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
