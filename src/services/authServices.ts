import { prisma } from "../index.js";
import bcrypt from "bcrypt";
import { Profession, SALT_ROUND } from "../utils/constants.js";
import { GeneralError } from "../utils/generalError.js";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phonenumber: number;
  password: string;
  profession: Profession;
  document: string;
  profilePic?: string;
}
const signUpUser = async ({
  email,
  firstName,
  lastName,
  username,
  phonenumber,
  password,
  profession,
  document,
}: User) => {
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          username,
        },
        {
          email,
        },
        {
          phonenumber,
        },
      ],
    },
  });

  if (user) {
    throw new GeneralError(
      409,
      "Account with given Username, Email or Phonenumber already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

  user = await prisma.user.create({
    data: {
      username,
      email,
      phonenumber,
      firstName,
      lastName,
      document,
      password: hashedPassword,
      profession,
    },
  });

  return user.username;
};

const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new GeneralError(404, "Username not found.");
  }

  const isPasswordCorrect: boolean = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new GeneralError(401, "Incorrect Password");
  }

  return user.username;
};
