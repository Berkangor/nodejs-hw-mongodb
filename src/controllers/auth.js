import createHttpError from 'http-errors';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // Render'da true olur
  path: '/',
  maxAge: THIRTY_DAYS,
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
 
  const result = await loginUser(req.body);

  const session = result.session ?? result; // esnek
  const accessToken = result.accessToken ?? session.accessToken;
  const refreshToken = result.refreshToken ?? session.refreshToken;

  res.cookie('sessionId', String(session._id), cookieOpts);
  res.cookie('refreshToken', refreshToken, cookieOpts);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const refreshUserController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies ?? {};
  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Unauthorized');
  }

  const { session, accessToken, refreshToken: newRefresh } = await refreshSession({
    sessionId,
    refreshToken,
  });

  res.cookie('sessionId', String(session._id), cookieOpts);
  res.cookie('refreshToken', newRefresh, cookieOpts);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies ?? {};

  if (sessionId && refreshToken) {
    await logoutUser({ sessionId, refreshToken });
  }

  res.clearCookie('sessionId', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

    res.status(204).end();
    
};
export {
  registerUserController as registerController,
  loginUserController    as loginController,
  refreshUserController  as refreshController,
  logoutUserController   as logoutController,
};