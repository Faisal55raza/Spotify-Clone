import type { RequestHandler, Request, Response, NextFunction } from "express";

const TryCatch = <T extends Request = Request>(handler: (req: T, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req as T, res, next);
        } catch (error: any) {
            console.error("Error occurred:", error);
            res.status(500).json({ message: error.message || "Error Not Known" });
        }
    };
};

export default TryCatch;
