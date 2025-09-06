import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import { env } from '../utils/env.js';

const JWT_SECRET = env('JWT_SECRET');
const JWT_REFRESH_SECRET = env('JWT_REFRESH_SECRET');

const ACCESS_TTL_MS = 15 * 60 * 1000;            // 15 dakika
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

export const registerUser = async (payload) => {
  const exists = await User.findOne({ email: payload.email });
  if (exists) throw createHttpError(409, 'Email in use');

  try {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const doc = await User.create({ ...payload, password: hashedPassword });
    const { password, ...safe } = doc.toObject(); // şifreyi dışarı verme
    return safe;
  } catch (e) {
    if (e?.code === 11000) throw createHttpError(409, 'Email in use');
    throw e;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'User not found!');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw createHttpError(401, 'Unauthorized');

  // Tek aktif oturum politikası
  await Session.deleteOne({ userId: user._id });

  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  const now = Date.now();
  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now + ACCESS_TTL_MS),
    refreshTokenValidUntil: new Date(now + REFRESH_TTL_MS),
  });

  return { session, accessToken, refreshToken };
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  // Refresh token geçerli mi?
  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw createHttpError(401, 'Unauthorized');
  }

  // Bu token bu session'a mı ait?
  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) throw createHttpError(401, 'Session not found');

  const user = await User.findById(session.userId);
  if (!user) throw createHttpError(401, 'User not found');

  // Eski oturumu sil → yeni oturum oluştur
  await Session.deleteOne({ _id: session._id });

  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  const now = Date.now();
  const newSession = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(now + ACCESS_TTL_MS),
    refreshTokenValidUntil: new Date(now + REFRESH_TTL_MS),
  });

  return { session: newSession, accessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async ({ sessionId, refreshToken }) => {
  await Session.deleteOne({ _id: sessionId, refreshToken });
};
