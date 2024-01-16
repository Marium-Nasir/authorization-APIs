/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class GenerateTokenForLink {
  constructor(private readonly jwtService: JwtService) {}

  async genTokenForLink(payload, expiresIn) {
    try {
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: expiresIn,
      });
      return token;
    } catch (err) {
      return err;
    }
  }

  async decodeToken(token: string) {
    try {
      const decoded = await this.jwtService.decode(token);
      return decoded;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async verifyToken(token: string) {
    try {
      const verified = await this.jwtService.verifyAsync(token);
      return verified;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
