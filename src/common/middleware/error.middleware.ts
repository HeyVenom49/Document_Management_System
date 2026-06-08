import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { AppError } from "../errors/app.error.ts";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message === "Unsupported file type") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
