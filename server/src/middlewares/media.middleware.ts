import { Request, Response, NextFunction } from "express";

export const validateMediaTypes = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body || !req.body.fileType) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Request body or fileType is missing.",
    });
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/mp3",
    "application/pdf",
    "text/plain",
  ];
  if (!allowedMimeTypes.includes(req.body.fileType)) {
    return res.status(415).json({
      error: "Unsupported Media Type",
      message: `File type ${req.body.fileType} is not allowed.`,
    });
  }
  next();
};
