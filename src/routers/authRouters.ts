import express, { Router, Request, Response } from "express";
import { upload } from "../middlewares/imageHandler.js";
import { IMAGE } from "../utils/constants.js";
import { loginScheme, signUpScema } from "../utils/zodSchemas.js";
import { loginUser, signUpUser } from "../services/authServices.js";

export const authRouter: Router = express.Router();

authRouter.post(
  "/signup",
  upload.single(IMAGE),
  async (req: Request, res: Response) => {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        phonenumber,
        profession,
      } = signUpScema.parse(JSON.parse(req.body.data));

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
      console.log(error);
    }
  }
);

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = loginScheme.parse(req.body);
    await loginUser({ username, password });
    res.status(200).send({ message: "Logged In" });
  } catch (error) {
    console.log(error);
  }
});
