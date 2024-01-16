import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserData, userSchema } from './auth/Schemas/user.schema';
import { GenerateToken } from './auth/helpingFunctions/generateJWT';
import { GenerateTokenForLink } from './authtest/helpingfunctions/genJWT';
// import { UserData } from './auth/Schemas/user.schema';
import { AuthtestController } from './authtest/authtest.controller';
import { AuthtestModule } from './authtest/authtest.module';
import { ClientData, clientSchema } from './authtest/schemas/client.schema';
import { AuthtestService } from './authtest/authtest.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    MongooseModule.forFeature([{ name: UserData.name, schema: userSchema }]),
    MongooseModule.forFeature([
      { name: ClientData.name, schema: clientSchema },
    ]),
    MailModule,
    AuthModule,
    AuthtestModule,
  ],
  controllers: [AppController, AuthController, AuthtestController],
  providers: [
    AppService,
    AuthService,
    GenerateToken,
    AuthtestService,
    GenerateTokenForLink,
  ],
})
export class AppModule {}
