import { prisma } from "../index.js";
import { GeneralError } from "../utils/generalError.js";
import { postSchema } from "../utils/zodSchemas.js";
import { z } from "zod";
export const createPost = async (
  authorUsername: string,
  { title, description, tag }: z.infer<typeof postSchema>,
  image: string | null
) => {
  const author = await prisma.user.findUnique({
    where: {
      username: authorUsername,
    },
  });
  if (!author) throw new GeneralError(404, "User not found.");
  const post = await prisma.post.create({
    data: {
      description,
      authorId: author.id,
      title,
      tag,
      image,
    },
  });
  if (!post)
    throw new GeneralError(409, "Some error occured while posting the post.");
  return post;
};

export const getAllPosts = async () => {
  const posts = await prisma.post.findMany({ include: { author: true } });
  if (!posts) throw new GeneralError(404, "Posts not found.");
  const postsAuthors = posts.map((post) => {
    const {
      document,
      id,
      isVerified,
      phonenumber,
      password,
      ...authorDetails
    } = post.author;
    const { author, authorId, ...remainingpost } = post;
    return { ...remainingpost, authorDetails };
  });
  return postsAuthors;
};
