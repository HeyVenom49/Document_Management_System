import { AppError } from "./app.error.ts";

export class Conflict extends AppError {
  constructor(message = "Conflict") {
    super(message, 412);
  }
}
