import { AppError } from "./app.error.ts";

export class BadRequest extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}
