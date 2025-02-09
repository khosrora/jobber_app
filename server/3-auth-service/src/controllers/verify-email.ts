import { IAuthDocument } from '@auth/helper/auth.interface';
import { BadRequestError } from '@auth/helper/error-handler';
import { getAuthUserById, getAuthUserByVerificationToken, updateVerifyEmailField } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function update(req: Request, res: Response): Promise<void> {
  const { token } = req.body;
  const checkIfUserExist: IAuthDocument = await getAuthUserByVerificationToken(token);
  if (!checkIfUserExist) {
    throw new BadRequestError('Verification token is either invalid or is already used', 'VerifyEmail update() method error');
  }

  await updateVerifyEmailField(checkIfUserExist.id!, 1, '');
  const updateUser = await getAuthUserById(checkIfUserExist.id!);
  res.status(StatusCodes.OK).json({ message: 'Email Verified successfully .', user: updateUser });
}
