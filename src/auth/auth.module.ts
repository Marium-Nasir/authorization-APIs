/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserData, userSchema } from './Schemas/user.schema';
import { MailService } from 'src/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GenerateToken } from './helpingFunctions/generateJWT';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserData.name, schema: userSchema }]),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [MailService, GenerateToken],
})
export class AuthModule {}
