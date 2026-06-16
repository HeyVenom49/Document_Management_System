import type { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

export const sendCreated = (res: Response, data: unknown) =>
  sendSuccess(res, data, 201);

export const sendMessage = (res: Response, message: string, status = 200) =>
  res.status(status).json({ success: true, message });

export const sendPaginated = (
  res: Response,
  data: unknown,
  pagination: unknown,
) => res.status(200).json({ success: true, data, pagination });

export const sendDownloadRedirect = (res: Response, downloadUrl: string) =>
  res.redirect(302, downloadUrl);
