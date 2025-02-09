import { config } from '@auth/config';
import { IAuthDocument, IEmailMessageDetails } from '@auth/helper/auth.interface';
import { BadRequestError } from '@auth/helper/error-handler';
import { AuthModel } from '@auth/models/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { changePasswordSchema, emailSchema, passwordSchema } from '@auth/schemes/password';
import { authChannel } from '@auth/server';
import {
  getAuthUserByPasswordToken,
  getUserByEmail,
  getUserByUsername,
  updatePassword,
  updatePasswordToken
} from '@auth/services/auth.service';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(emailSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'password forgotPassword()method error');
  }
  const { email } = req.body;
  const existingUser: IAuthDocument = await getUserByEmail(email);
  if (!existingUser) {
    throw new BadRequestError('invalid credentials', 'password forgotPassword()method error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');

  const date: Date = new Date();
  date.setHours(date.getHours() + 1);
  await updatePasswordToken(existingUser.id!, randomCharacters, date);
  const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomCharacters}`;

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    resetLink,
    username: existingUser.username,
    template: 'forgotPassword'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Forgot Password message sent to notification service.'
  );
  res.status(StatusCodes.OK).json({ message: 'password reset email sent ...' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(passwordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'password resetPassword()method error');
  }

  const { password, confirmPassword } = req.body;
  const { token } = req.params;
  if (password !== confirmPassword) {
    throw new BadRequestError('password do not match', 'password resetPassword()method error');
  }

  const existingUser: IAuthDocument = await getAuthUserByPasswordToken(token);
  if (!existingUser) {
    throw new BadRequestError('reset Token has expired', 'password resetPassword()method error');
  }

  const hashedPassword: string = await AuthModel.prototype.hashPassword(password);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Reset Password success message sent to notification service.'
  );
  res.status(StatusCodes.OK).json({ message: 'password successfully updated' });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'password changePassword()method error');
  }

  const { currentPassword, newPassword } = req.body;

  if (currentPassword !== newPassword) {
    throw new BadRequestError('invalid Password', 'password changePassword()method error');
  }

  const existingUser: IAuthDocument = await getUserByUsername(`${req.currentUser?.username}`);
  if (!existingUser) {
    throw new BadRequestError('Invalid password', 'password changePassword()method error');
  }

  const hashedPassword: string = await AuthModel.prototype.hashPassword(newPassword);
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: 'resetPasswordSuccess'
  };
  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Password change success message sent to notification service.'
  );
  res.status(StatusCodes.OK).json({ message: 'password successfully updated' });
}
