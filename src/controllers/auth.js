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

export const registerUserController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const { session, accessToken, refreshToken } = await loginUser(req.body);

    // refresh için cookie'ler
    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.cookie('sessionId', String(session._id), COOKIE_OPTS);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshUserController = async (req, res, next) => {
  try {
    const { refreshToken, sessionId } = req.cookies || {};
    if (!refreshToken || !sessionId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const {
      session: newSession,
      accessToken,
      refreshToken: newRefreshToken,
    } = await refreshSession({ sessionId, refreshToken });

    // rotate cookie'ler
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTS);
    res.cookie('sessionId', String(newSession._id), COOKIE_OPTS);

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUserController = async (req, res, next) => {
  try {
    const { refreshToken, sessionId } = req.cookies || {};
    if (refreshToken && sessionId) {
      await logoutUser({ sessionId, refreshToken });
    }

    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const token = jwt.sign({ email }, getEnvVar('JWT_SECRET'), { expiresIn: '5m' });

    // LMS (dev) ve prod için APP_DOMAIN normalizasyonu:
    // dev:  APP_DOMAIN=http://localhost:3000/auth
    // prod: APP_DOMAIN=https://<render-domain>
    const rawBase = getEnvVar('APP_DOMAIN', 'http://localhost:3000/auth');
    const base = rawBase.replace(/\/+$/, '').replace(/\/auth$/, '');

    const resetLink = `${base}/reset-password?token=${encodeURIComponent(token)}`;

    await sendResetMail({ to: email, resetLink });

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (err) {
    // Mailer ya da SMTP hatalarında anlaşılır 500 döndür
    if (!err.status) {
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }
    next(err);
  }
};

export const resetPwdController = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, getEnvVar('JWT_SECRET'));
    } catch {
      throw createHttpError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    // tüm aktif oturumları kapat
    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
