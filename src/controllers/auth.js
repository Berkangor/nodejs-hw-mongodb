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
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: THIRTY_DAYS,
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user, // şifresiz kullanıcı
  });
};

export const loginUserController = async (req, res) => {
  const { session, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie('sessionId', String(session._id), cookieOpts);
  res.cookie('refreshToken', refreshToken, cookieOpts);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!', // ödevin birebir metni
    data: { accessToken },
  });
};

export const refreshUserController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies ?? {};
  if (!sessionId || !refreshToken) {
    return res.status(401).json({ status: 401, message: 'Unauthorized' });
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

// Router'ın kullandığı alias'lar
export {
  registerUserController as registerController,
  loginUserController    as loginController,
  refreshUserController  as refreshController,
  logoutUserController   as logoutController,
};
