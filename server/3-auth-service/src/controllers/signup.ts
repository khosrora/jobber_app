import { BadRequestError } from '@auth/helper/error-handler';
import { signupSchema } from '@auth/schemes/signup';
import { createAuthUser, getAuthUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import crypto from 'crypto';
import { IAuthDocument, IEmailMessageDetails } from '@auth/helper/auth.interface';
import { firstLetterUppercase, lowerCase } from '@auth/helper/helpers';
import { StatusCodes } from 'http-status-codes';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { config } from '@auth/config';

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'signup create()method error');
    }
    const { username, email, password, country } = req.body;
    const checkIfUserExist = await getAuthUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('invalid credentials .Email or username', 'signup create()method error');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      password,
      country,
      emailVerificationToken: randomCharacters,
      passwordResetToken: randomCharacters
    } as IAuthDocument;

    const result: IAuthDocument = await createAuthUser(authData);
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;

    const messageDetails: IEmailMessageDetails = {
      receiverEmail: result.email,
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

    const userJWT: string = signToken(result.id!, result.email!, result.username!);

    res.status(StatusCodes.CREATED).json({ message: 'User created sucssefully ...', user: result, token: userJWT });
  } catch (error) {
    console.log(error);
  }
}
