import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import config from '../../config/env.js';

const SALT_ROUNDS = 12;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

export const register = async ({ email, password, fullName }) => {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db.insert(users).values({
    email,
    password: hashedPassword,
    fullName,
  }).returning({ id: users.id, email: users.email, fullName: users.fullName, createdAt: users.createdAt });

  const token = signToken(user);
  return { user, token };
};

export const login = async ({ email, password }) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);

  const token = signToken(user);
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const logout = async () => null;

export const refreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const [user] = await db.select({ id: users.id, email: users.email })
      .from(users).where(eq(users.id, decoded.id)).limit(1);
    if (!user) throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED);
    return { token: signToken(user) };
  } catch {
    throw new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
  }
};

export const getProfile = async (userId) => {
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    fullName: users.fullName,
    avatarUrl: users.avatarUrl,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(eq(users.id, userId)).limit(1);

  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return user;
};
