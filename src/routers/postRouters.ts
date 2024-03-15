import express, { Request, Response, NextFunction, Router } from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { POST_IMAGE } from "../utils/constants.js";
import { postSchema } from "../utils/zodSchemas.js";
import { bucket } from "../config/firebase.js";
import { getDownloadURL } from "firebase-admin/storage";
import { createPost } from "../services/postServices.js";
import { CustomRequest, verifyToken } from "../middlewares/verifyToken.js";
export const postRouter: Router = express.Router();

postRouter.post(
  "/create",
  [verifyToken, upload.single(POST_IMAGE)],
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, tag } = postSchema.parse(
        JSON.parse(req.body.data)
      );
      let url: string | null = null;
      if (req.file) {
        const fileRef = bucket.file(
          `posts/` + req.file.originalname + "-" + Date.now()
        );
        await fileRef.save(req.file.buffer, {
          metadata: { contentType: req.file.mimetype },
        });
        url = await getDownloadURL(fileRef);
      }
      if (req.user) {
        await createPost(req.user.username, { title, description, tag }, url);
        res.status(200).send({ message: "Posted Successfully!" });
      } else {
        res.send({});
      }
    } catch (error) {
      next(error);
    }
  }
);
