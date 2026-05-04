import type { CookieOptions, Request, Response } from "express";
import ms, { type StringValue } from "ms";

const cookieOptions = (age: string) => {
  const ageInMs = ms(age as StringValue);

  const options: CookieOptions = {
    path: "/",
    signed: true,
    httpOnly: true,
    secure: true,
    maxAge: ageInMs,
    sameSite: "none",
  };

  return options;
};

const setCookie = (res: Response, key: string, value: string, options: CookieOptions) => {
  res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
  const cookie = req.signedCookies?.[key] || req.cookies?.[key] || null;
  return cookie;
};

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
  cookieOptions,
};
