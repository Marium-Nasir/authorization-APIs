/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class GenerateToken {
  constructor(private readonly jwtService: JwtService) {}
  async genToken(payload) {
    // const expiresInSec = parseInt(expiresIn);
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
