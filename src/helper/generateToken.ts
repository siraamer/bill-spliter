import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  iat: number;
}

const generateToken = (id: any) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRIS,
  });
};

export default generateToken;
