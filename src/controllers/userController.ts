import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import generateToken from '../helper/generateToken';
import Jwt from 'jsonwebtoken';
import User from '../models/userModel';
import HttpException from '../helper/apiError';
import catchAsync from '../helper/catchAsync';
import { JwtPayload } from '../helper/generateToken';

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new HttpException(400, 'Please Provide Your Credentials!'));
    }
    let user = await User.findOne({ email });
    if (user) {
      return next(
        new HttpException(
          400,
          'This Email Is Already Exist, Please Try To Log In!'
        )
      );
    } else {
      user = await User.create({ name, email, password });
    }
    const token = generateToken(user._id);
    res.status(201).json({
      status: 'success',
      data: { user },
      token,
    });
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpException(400, 'Please Provide Your Credentials!'));
    }
    let user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new HttpException(401, 'Incorrect email or password'));
    }
    const token = generateToken(user._id);
    user.password = undefined;
    res.status(200).json({
      status: 'success',
      data: { user },
      token,
    });
  }
);

const restricted = (exports.protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) check if token exist & if token exist hold it
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new HttpException(401, `You are not login, please try to login!`)
      );
    }
    // 2) verfiy the token (no change happened || token expired )
    const decoded = Jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log(decoded);

    // 3) check if user exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      next(
        new HttpException(
          401,
          `the user that belong this token does no longer exist!`
        )
      );
    }
    // 4) check if password change after token created
    if (currentUser.passwordChangedAt) {
      const passwordChangedTimestamp =
        currentUser.passwordChangedAt.getTime() / 1000;
      if (passwordChangedTimestamp > decoded.iat) {
        next(
          new HttpException(
            401,
            `the user changed his password recently, please login again!`
          )
        );
      }
    }
    next();
  }
));

const deleteAllUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.deleteMany();
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({});
    res.status(200).json({
      status: 'success',
      result: users.length,
      data: users,
    });
  }
);

export { signup, deleteAllUser, getAllUsers, login, restricted };
