/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientData, clientSchema } from './schemas/client.schema';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { GenerateTokenForLink } from 'src/authtest/helpingfunctions/genJWT';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientData.name, schema: clientSchema },
    ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      // signOptions: {
      //   expiresIn: '1h',
      // },
    }),
  ],
  providers: [MailService, GenerateTokenForLink],
})
export class AuthtestModule {}
