/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class ClientData {
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

  @Prop({ default: false })
  isVerified: boolean;
}

export const clientSchema = SchemaFactory.createForClass(ClientData);
