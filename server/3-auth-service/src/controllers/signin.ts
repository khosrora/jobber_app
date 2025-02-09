import { IAuthDocument } from '@auth/helper/auth.interface';
import { BadRequestError } from '@auth/helper/error-handler';
import { isEmail } from '@auth/helper/helpers';
import { AuthModel } from '@auth/models/auth.schema';
import { loginSchema } from '@auth/schemes/signin';
import { getUserByEmail, getUserByUsername, signToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function read(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(loginSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'signin read()method error');
  }
  const { username, password } = req.body;

  const isValidEmail: boolean = isEmail(username);
  const existingUser: IAuthDocument = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials', 'signin read()method error');
  }
  const passwordMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
  if (!passwordMatch) {
    throw new BadRequestError('Invalid credentials', 'signin read()method error');
  }
  const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
  const userData: IAuthDocument = omit(existingUser, ['password']);

  res.status(StatusCodes.CREATED).json({ message: 'User login sucssefully ...', user: userData, token: userJWT });
}
