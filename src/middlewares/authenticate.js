import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) throw createHttpError(401, 'Authorization header is not found!');

    // "Bearer    <token>" gibi varyasyonlara dayanıklı
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2) throw createHttpError(401, 'Bearer token is missing or malformed.');

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme) || !token) {
      throw createHttpError(401, 'Bearer token is missing or malformed.');
    }

    // 1) JWT doğrula
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET); // { id, iat, exp, ... }
    } catch (e) {
      if (e?.name === 'TokenExpiredError') {
        throw createHttpError(401, 'Access token expired');
      }
      throw createHttpError(401, 'Unauthorized');
    }

    // 2) Bu accessToken için aktif session var mı?
    const session = await Session.findOne({ accessToken: token }).lean();
    if (!session) throw createHttpError(401, 'Session not found.');

    // 3) Token - session - user eşleşmesi (ek güvenlik)
    if (session.userId && String(session.userId) !== String(payload.id)) {
      throw createHttpError(401, 'Unauthorized');
    }

    // 4) Access token süresi dolmuş mu? (ödev gereği)
    if (session.accessTokenValidUntil &&
        new Date(session.accessTokenValidUntil).getTime() <= Date.now()) {
      throw createHttpError(401, 'Access token expired');
    }

    // 5) Kullanıcı mevcut mu?
    const user = await User.findById(payload.id);
    if (!user) throw createHttpError(401, 'User not found.');

    req.user = user;
    req.session = session;
    return next();
  } catch (err) {
    return next(err);
  }
};
