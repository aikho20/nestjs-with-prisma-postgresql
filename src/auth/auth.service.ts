import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';
import { User, UserType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  JwtAccessPayload,
  RefreshTokenPayload,
} from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

export interface LoginContext {
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, context: LoginContext = {}) {
    const user: any = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email not exist!');
    }

   await this.passwordMatchesHash(user, password);

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active!');
    }

    const token = await this.issueTokenPair(user, context);

    return {
      ...token,
      UserType: user.userType,
    };
  }
  async issueTokenPair(user: User, context: LoginContext = {}) {
    const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        deviceLabel: 'Untitled',
        ipAddress: context?.ipAddress as string,
        refreshTokenHashed: '',
        expiresAt: expiredAt,
      },
    });
    const accessTokenPayload: JwtAccessPayload = {
      userId: user?.id,
      email: user.email,
      userType: user?.userType,
      sid: session.id,
    };
    const refreshTokenPayload: RefreshTokenPayload = {
      userId: user?.id,
      sessionId: session.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(accessTokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as never,
      }),

      this.jwtService.sign(refreshTokenPayload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as never,
      }),
    ]);

    const refreshTokenHashed = await bcrypt.hash(refreshToken, 10);

    await this.prisma.userSession.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHashed: refreshTokenHashed,
      },
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  private async passwordMatchesHash(
    user: User | null,
    password: string,
  ): Promise<void> {
    const hash = user?.passwordHash as string;
    const match = await bcrypt.compare(password, hash);
    if (!user || !match) {
      throw new BadRequestException('Invalid email or password');
    }
  }
}
