import { AppError } from "./app.error.ts";

export class NotFound extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
