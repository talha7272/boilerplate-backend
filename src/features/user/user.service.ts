import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../db/drizzle.module';
import { users } from '../../db/schema';
import { AppException } from '../../common/exceptions/app.exception';
import { HTTP_STATUS } from '../../constants/http-status';
import { AppConfig } from '../../config/configuration';

const SALT_ROUNDS = 12;

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  private signToken(user: { id: string; email: string }): string {
    const secret: jwt.Secret = this.configService.get('jwt.secret', { infer: true });
    const options: jwt.SignOptions = {
      expiresIn: this.configService.get('jwt.expiresIn', { infer: true }) as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ id: user.id, email: user.email }, secret, options);
  }

  async register({ email, password, fullName }: { email: string; password: string; fullName: string }) {
    const existing = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new AppException('Email already in use', HTTP_STATUS.CONFLICT);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await this.db
      .insert(users)
      .values({ email, password: hashedPassword, fullName })
      .returning({ id: users.id, email: users.email, fullName: users.fullName, createdAt: users.createdAt });

    const token = this.signToken(user);
    return { user, token };
  }

  async login({ email, password }: { email: string; password: string }) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) throw new AppException('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppException('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

    const token = this.signToken(user);
    const { password: _password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async logout(_token?: string) {
    return null;
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.configService.get('jwt.secret', { infer: true })) as {
        id: string;
      };
      const [user] = await this.db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);
      if (!user) throw new AppException('User not found', HTTP_STATUS.UNAUTHORIZED);
      return { token: this.signToken(user) };
    } catch {
      throw new AppException('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
    }
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new AppException('User not found', HTTP_STATUS.NOT_FOUND);
    return user;
  }
}
