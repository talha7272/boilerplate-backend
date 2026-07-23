import * as userService from "./user.service.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const data = await userService.register(req.body);
    console.log({ data });
    sendCreated(
      res,
      data,
      "Registration successful. Please check your email to confirm your account.",
    );
  } catch (err) {
    console.log({ err });
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await userService.login(req.body);
    sendSuccess(res, data, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await userService.logout(token);
    sendSuccess(res, null, "Logged out successfully");
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const data = await userService.refreshToken(refreshToken);
    sendSuccess(res, data, "Token refreshed");
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
};
