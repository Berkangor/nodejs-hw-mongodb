import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // bcrypt -> bcryptjs
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import { sendResetMail } from '../services/mailer.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  expires: new Date(Date.now() + THIRTY_DAYS),
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  // servis: { session, accessToken, refreshToken } döner
  const { session, accessToken, refreshToken } = await loginUser(req.body);

  // Refresh için iki cookie yazalım: refreshToken + sessionId
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.cookie('sessionId', String(session._id), COOKIE_OPTS);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: { accessToken },
  });
};

export const refreshUserController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies || {};
  if (!refreshToken || !sessionId) {
    throw createHttpError(401, 'Unauthorized');
  }

  // servis imzasına uygun çağrı
  const {
    session: newSession,
    accessToken,
    refreshToken: newRefreshToken,
  } = await refreshSession({ sessionId, refreshToken });

  // rotate cookie’ler
  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
  res.cookie('sessionId', String(newSession._id), COOKIE_OPTS);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const { refreshToken, sessionId } = req.cookies || {};
  if (refreshToken && sessionId) {
    await logoutUser({ sessionId, refreshToken });
  }

  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};

export const sendResetEmailController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), { expiresIn: '5m' });
  const base = getEnvVar('APP_DOMAIN', 'http://localhost:3000/auth').replace(/\/+$/, '');
  const resetLink = `${base}/reset-password?token=${token}`;

  try {
    await sendResetMail({ to: email, resetLink });
  } catch {
    // ESLint: unused param yok; kullanıcıya anlaşılır 500
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPwdController = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch {
    // ESLint: 'e' kullanılmıyor -> optional catch binding
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  await user.save();

  // Tüm aktif oturumları kapat
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
