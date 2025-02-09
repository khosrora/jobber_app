import { BadRequestError } from '@auth/helper/error-handler';
import { firstLetterUppercase, lowerCase } from '@auth/helper/helpers';
import { createAuthUser, getAuthUserByUsernameOrEmail } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { Request, Response } from 'express';
import { generateUsername } from 'unique-username-generator';
import { v4 as uuidV4 } from 'uuid';
import crypto from 'crypto';
import { IAuthDocument } from '@auth/helper/auth.interface';
import { sample } from 'lodash';
import { StatusCodes } from 'http-status-codes';

export async function create(req: Request, res: Response): Promise<void> {
  const { count } = req.params;
  const usernames: string[] = [];
  for (let i = 0; i < parseInt(count, 10); i++) {
    const username: string = generateUsername('', 0, 12);
    usernames.push(firstLetterUppercase(username));
  }

  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    const email = faker.internet.email();
    const password = '153333';
    const country = faker.location.country();
    const profilePicture = faker.image.urlPicsumPhotos();
    const checkIfUserExist = await getAuthUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('invalid credentials .Email or username', 'seed create() method error');
    }
    const profilePublicId = uuidV4();
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture,
      emailVerificationToken: randomCharacters,
      emailVerified: sample([0, 1]),
      passwordResetToken: randomCharacters
    } as IAuthDocument;
    await createAuthUser(authData);
  }
  res.status(StatusCodes.OK).json({ message: 'Seed users created successfully .' });
}
