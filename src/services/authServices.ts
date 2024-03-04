import { prisma } from "../index.js";
import { Profession } from "../utils/constants.js";
import { GeneralError } from "../utils/generalError.js";

interface User {
  id: string;
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
const createUser = async ({
  id,
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

  user = await prisma.user.create({
    data: {
      username,
      email,
      phonenumber,
      firstName,
      lastName,
      document,
      password,
      profession,
    },
  });

  return user.username;
};
