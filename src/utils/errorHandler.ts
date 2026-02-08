import { Response } from "express";

interface ErrorMessage extends Error {
  status?: number;
}

export const tryError = (message: string, status: number) => {
  const error: ErrorMessage = new Error(message);
  error.status = status;
  return error;
};

export const catchError = ( error: unknown, res: Response, prodMessage: string = "Internal Server Error") => {
  if (error instanceof Error) {
    const status = (error as ErrorMessage).status || 500;

    const message = process.env.NODE_ENV === "development" ? error.message : prodMessage;

    const response: any = { success: false, message, status };

    if (process.env.NODE_ENV === "development" && error.stack) {
      const stackLines = error.stack
        .split("\n")
        .filter((line) => !line.includes("node_modules") && line.trim() !== "");

      response.stack = stackLines.map((line) => line.trim());

      // Location: pick first line outside errorHandler.ts
      const locationLine =
        stackLines.find(
          (line) =>
            !line.includes("node_modules") &&
            !line.includes("errorHandler.ts") &&
            line.trim().startsWith("at")
        ) || "";

      // Extract only file:line:column
      const match = locationLine.match(/\((.*)\)/) || locationLine.match(/at (.*)/);
      response.location = match ? match[1] : locationLine;
    }

    return res.status(status).json(response);
  } 
  else {
    return res
      .status(500)
      .json({ success: false, message: prodMessage, status: 500 });
    }
};
