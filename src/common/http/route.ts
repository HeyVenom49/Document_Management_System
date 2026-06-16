import type { RequestHandler } from "express";

export function route<T extends object>(
  controller: T,
  method: keyof T,
): RequestHandler {
  const handler = controller[method];

  if (typeof handler !== "function") {
    throw new Error(`Route handler "${String(method)}" is not a function`);
  }

  return handler.bind(controller) as RequestHandler;
}
