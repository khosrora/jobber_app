import { IAuthDocument, IEmailMessageDetails } from '@auth/helper/auth.interface';
import { BadRequestError } from '@auth/helper/error-handler';
import { lowerCase } from '@auth/helper/helpers';
import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';

export async function read(req: Request, res: Response): Promise<void> {
  let user = null;
  const existingUser: IAuthDocument = await getAuthUserById(req.currentUser!.id);
  if (Object.keys(existingUser).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: 'authentication user', user });
}

export async function resendEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;
  const checkIfUserExist: IAuthDocument = await getUserByEmail(lowerCase(email));
  if (!checkIfUserExist) {
    throw new BadRequestError('Email is invalid', 'currentUser resentEmail() method error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service'
  );

  const updatedUser = getAuthUserById(parseInt(userId));

  res.status(StatusCodes.CREATED).json({ message: 'email verification sent.', user: updatedUser });
}
