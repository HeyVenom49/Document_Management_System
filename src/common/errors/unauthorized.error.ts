import { AppError } from "./app.error.ts";

export class Unauthorized extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
