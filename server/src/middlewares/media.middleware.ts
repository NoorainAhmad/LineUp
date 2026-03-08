import { Request, Response, NextFunction } from "express";

export const validateMediaTypes = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/mp3",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!req.body) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Request body is missing.",
    });
  }

  const fileTypes: string[] = [];

  if (typeof req.body.fileType === "string") {
    fileTypes.push(req.body.fileType);
  }

  if (Array.isArray(req.body.files)) {
    for (const file of req.body.files) {
      const type = file?.fileType ?? file?.mimeType;
      if (typeof type !== "string" || !type.trim()) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Each file must include a valid fileType.",
        });
      }
      fileTypes.push(type);
    }
  }

  if (fileTypes.length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message: "fileType or files[].fileType is required.",
    });
  }

  const unsupportedType = fileTypes.find(
    (type) => !allowedMimeTypes.includes(type),
  );

  if (unsupportedType) {
    return res.status(415).json({
      error: "Unsupported Media Type",
      message: `File type ${unsupportedType} is not allowed.`,
    });
  }
  next();
};
