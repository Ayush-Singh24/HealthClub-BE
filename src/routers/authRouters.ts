import express, { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/imageHandler.js";
import { IMAGE } from "../utils/constants.js";
import { loginSchema, signUpSchema } from "../utils/zodSchemas.js";
import { loginUser, signUpUser } from "../services/authServices.js";
import jwt, { Secret } from "jsonwebtoken";

export const authRouter: Router = express.Router();

authRouter.post(
  "/signup",
  upload.single(IMAGE),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phonenumber,
        profession,
      } = signUpSchema.parse(JSON.parse(req.body.data));

      if (!req.file) {
        throw new Error("Attach image");
      }
      await signUpUser(
        {
          username,
          email,
          password,
          firstName,
          lastName,
          phonenumber,
          profession,
        },
        req.file.path
      );
      res.status(201).send({ message: "Signed Up" });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      await loginUser({ username, password });
      const token = jwt.sign(
        { username: username },
        process.env.PRIVATE_KEY as Secret,
        {
          expiresIn: "5d",
        }
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 5 * 24 * 3600 * 1000,
        })
        .status(200)
        .send({ message: "Logged In" });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/logout",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("token", null).status(200).send({ message: "Logged out" });
    } catch (error) {
      next(error);
    }
  }
);
