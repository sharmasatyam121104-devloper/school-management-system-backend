import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Response {
      sendResponse: (success?: boolean, message?: string, statusCode?: number, data?: any) => Response;
      sendError: (error: any, statusCode?: number) => Response;
    }
  }
}

export const sendResMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.sendResponse = (success = true, message = "Success", statusCode = 200, data?: any) => {
    return res.status(statusCode).json({ success, message, ...(data !== undefined && { data }) });
  };

  res.sendError = (error: any, statusCode = 500) => {
    const response: any = {
      success: false,
      message: error?.message || "Something went wrong",
    };

    if (process.env.NODE_ENV === "development" && error?.stack) {
      response.stack = error.stack;
      const lines = error.stack.split("\n");
      response.location = lines[1]?.trim();
    }

    return res.status(statusCode).json(response);
  };

  next();
};


// return res.sendSmart(true, "User created successfully!", 201, user);

// return res.sendError(err); // automatic 500, stack in dev