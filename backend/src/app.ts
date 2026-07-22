import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import { router } from "./routes";
import type { Request } from "express";

export const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(
    express.json({
        verify: (request, _response, buffer) => {
        (request as Request).rawBody = Buffer.from(buffer);
        },
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);