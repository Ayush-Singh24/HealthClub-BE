import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { prisma } from "../index.js";
import { GeneralError } from "../utils/generalError.js";
interface JwtPayLoad {
  username: string;
}
interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    phonenumber: string;
    password: string;
    profession: string;
    document: string;
    profilePic: string | null;
  };
}
export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(
      token,
      process.env.PRIVATE_KEY as Secret
    ) as JwtPayLoad;
    const user = await prisma.user.findUnique({
      where: {
        username: decoded.username,
      },
    });
    if (!user) {
      throw new GeneralError(401, "Not Authorized");
    }
    next();
    req.user = user;
  } catch (error) {
    if (error instanceof GeneralError) {
      res.status(error.status).send({ message: error.message });
    } else {
      res.status(500).send({ message: "Server Error" });
    }
  }
};
