import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

const JWT_SECRET = env('JWT_SECRET');

export const authenticate = async (req, _res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header is not found!'));
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Bearer token is missing or malformed.'));
  }

  try {
    // 1) JWT doğrula
    const { id } = jwt.verify(token, JWT_SECRET);

    // 2) Bu accessToken için aktif session var mı?
    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      return next(createHttpError(401, 'Session not found.'));
    }

    // 3) Access token süresi dolmuş mu? (ödev gereği)
    if (
      session.accessTokenValidUntil &&
      session.accessTokenValidUntil.getTime() <= Date.now()
    ) {
      return next(createHttpError(401, 'Access token expired'));
    }

    // 4) Kullanıcı mevcut mu?
    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(401, 'User not found.'));
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }
    return next(createHttpError(401, 'Unauthorized'));
  }
};
