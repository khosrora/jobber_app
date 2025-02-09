import { ISellerDocument } from '@users/helper/seller.interface';
import { getRandomSellers, getSellerById, getSellerByUsername } from '@users/services/seller.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const id = async (req: Request, res: Response): Promise<void> => {
  const seller: ISellerDocument | null = await getSellerById(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'seller profile.', seller });
};

const username = async (req: Request, res: Response): Promise<void> => {
  const seller: ISellerDocument | null = await getSellerByUsername(req.params.username);
  res.status(StatusCodes.OK).json({ message: 'seller profile.', seller });
};

const random = async (req: Request, res: Response): Promise<void> => {
  const sellers: ISellerDocument[] = await getRandomSellers(parseInt(req.params.size));
  res.status(StatusCodes.OK).json({ message: 'random seller profile.', sellers });
};

export { id, username, random };
