import { AppError } from "./app.error.ts";

export class Forbidden extends AppError {
  constructor(message = "Access Denied") {
    super(message, 403);
  }
}
