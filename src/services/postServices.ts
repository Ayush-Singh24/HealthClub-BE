import { Post } from "@prisma/client";
import { prisma } from "../index.js";
import { GeneralError } from "../utils/generalError.js";
const createPost = async ({
  authorId,
  title,
  description,
  image,
  tag,
}: Post) => {
  const post = await prisma.post.create({
    data: {
      description,
      authorId,
      title,
      tag,
      image,
    },
  });
  if (!post)
    throw new GeneralError(409, "Some error occured while posting the post.");
  return post;
};
