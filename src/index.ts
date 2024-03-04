import express, { Express } from "express";
import { config } from "dotenv";
config();
import cors, { CorsOptions } from "cors";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./routers/authRouters.js";
import { errorHandler } from "./utils/errorHandler.js";
export const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

const app: Express = express();

const whitelist = ["http://localhost:3000", "http://localhost:8000"];
const corsOptions: CorsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/auth", authRouter);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}🚀`);
});
