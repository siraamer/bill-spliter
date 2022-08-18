import { Request, Response, NextFunction } from 'express';
import HttpException from '../helper/apiError';

const sendErrorToProd = (error: HttpException, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
    });
  }
};

const sendErrorToDev = (error: HttpException, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error,
    });
  }
};

function ErrorMiddleware(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  error.status = error.status || 500;
  error.message = error.message || 'Something went wrong';
  if (process.env.NODE_ENV === 'development') {
    sendErrorToDev(error, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorToProd(error, req, res);
  }
}

export default ErrorMiddleware;
