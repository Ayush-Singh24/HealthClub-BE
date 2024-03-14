import express, { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { IMAGE } from "../utils/constants.js";
import { loginSchema, signUpSchema } from "../utils/zodSchemas.js";
import { loginUser, signUpUser } from "../services/authServices.js";
import jwt, { Secret } from "jsonwebtoken";
import {
  StorageReference,
  UploadMetadata,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { fstorage } from "../config/firebase.js";

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
      console.log(req.file.originalname);

      const storageRef: StorageReference = ref(
        fstorage,
        `files/${req.file.originalname + Date.now()}`
      );
      const metaData: UploadMetadata = {
        contentType: req.file.mimetype,
      };
      const snapshot = await uploadBytes(storageRef, req.file.buffer, metaData);
      const url = await getDownloadURL(snapshot.ref);
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
        url
      );
      const token = jwt.sign(
        { username: username },
        process.env.PRIVATE_KEY as Secret,
        { expiresIn: "5d" }
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          maxAge: 5 * 24 * 3600 * 1000,
        })
        .status(201)
        .send({ message: "Signed Up" });
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

authRouter.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie("token", null).status(200).send({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
});
