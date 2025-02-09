import { config } from '@auth/config';
import { IAuthBuyerMessageDetails, IAuthDocument } from '@auth/helper/auth.interface';
import { firstLetterUppercase } from '@auth/helper/helpers';
import { AuthModel } from '@auth/models/auth.schema';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import { lowerCase, omit } from 'lodash';
import { Model, Op } from 'sequelize';

export async function createAuthUser(data: IAuthDocument): Promise<IAuthDocument> {
  const result: Model = await AuthModel.create(data);
  const messageDetails: IAuthBuyerMessageDetails = {
    username: result.dataValues.username,
    email: result.dataValues.email,
    country: result.dataValues.country,
    profilePicture: result.dataValues.profilePicture,
    createdAt: result.dataValues.createdAt,
    type: 'auth'
  };

  await publishDirectMessage(
    authChannel,
    'jobber-buyer-update',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer details sent to buyer service'
  );

  const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
  return userData;
}

export async function getAuthUserById(authId: number): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: {
      id: authId
    },
    attributes: {
      exclude: ['password']
    }
  })) as Model;

  return user.dataValues;
}

export async function getAuthUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: { [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }] }
  })) as Model;
  return user?.dataValues;
}

export async function getUserByUsername(username: string): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: { username: firstLetterUppercase(username) }
  })) as Model;
  return user.dataValues;
}

export async function getUserByEmail(username: string): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: { email: lowerCase(username) }
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByVerificationToken(token: string): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: { emailVerificationToken: token },
    attributes: {
      exclude: ['password']
    }
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByPasswordToken(token: string): Promise<IAuthDocument> {
  const user: Model<IAuthDocument> = (await AuthModel.findOne({
    where: { [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }] },
    attributes: {
      exclude: ['password']
    }
  })) as Model;
  return user.dataValues;
}

export async function updateVerifyEmailField(authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> {
  await AuthModel.update(
    {
      emailVerified,
      emailVerificationToken
    },
    {
      where: {
        id: authId
      }
    }
  );
}

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  await AuthModel.update(
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    },
    {
      where: {
        id: authId
      }
    }
  );
}

export async function updatePassword(authId: number, password: string): Promise<void> {
  await AuthModel.update(
    {
      password,
      passwordResetToken: '',
      passwordResetExpires: new Date()
    },
    {
      where: {
        id: authId
      }
    }
  );
}

export function signToken(id: number, email: string, username: string): string {
  return sign(
    {
      id,
      email,
      username
    },
    config.JWT_TOKEN!
  );
}
