import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { AppException } from "./common/exceptions/app.exception";
import { HTTP_STATUS } from "./constants/http-status";
import { AppConfig } from "./config/configuration";

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  app.set("trust proxy", 1);

  app.use(helmet());

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  const corsOrigins = configService.get("cors.origins", { infer: true });
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin ${origin} is not allowed`));
      },
      credentials: true,
    }),
  );

  app.use(
    morgan("combined", {
      skip: () => configService.get("env", { infer: true }) === "test",
    }),
  );

  const limiter = rateLimit({
    windowMs: configService.get("rateLimit.windowMs", { infer: true }),
    max: configService.get("rateLimit.max", { infer: true }),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });
  app.use("/api", limiter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors
          .flatMap((e) => Object.values(e.constraints ?? {}))
          .join(", ");
        return new AppException(messages, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix("api/v1", { exclude: ["health", "/"] });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get("port", { infer: true });
  const env = configService.get("env", { infer: true });

  const server = await app.listen(port);
  console.log(`Server running in ${env} mode on port ${port}`);

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    shutdown("unhandledRejection");
  });
}

bootstrap();
