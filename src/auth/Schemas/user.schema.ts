/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UserData {
  @Prop()
  name: string;

  @Prop({
    unique: [true, 'Email already exists'],
    set: (value: string) => value.toLowerCase(),
  })
  email: string;

  @Prop({
    minlength: 6,
    message: 'Password length should be greater than 6',
  })
  password: string;

  @Prop({ type: Object })
  otpCode: { otp: string; expiresIn: string };

  @Prop({default: false})
  isVerified: boolean;
}

export const userSchema = SchemaFactory.createForClass(UserData);
