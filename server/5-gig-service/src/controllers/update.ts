import { BadRequestError } from '@gig/helper/error-handler';
import { ISellerGig } from '@gig/helper/gig.interface';
import { gigUpdateSchema } from '@gig/schemes/gigs';
import { updateActiveProp, updateGig } from '@gig/services/gig.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const gigUpdate = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(gigUpdateSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Update gig()method error');
  }

  const gig: ISellerGig = {
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
    subCategories: req.body.subCategories,
    tags: req.body.tags,
    price: req.body.price,
    expectedDelivery: req.body.expectedDelivery,
    basicTitle: req.body.basicTitle,
    basicDescription: req.body.basicDescription
  };

  const updatedGig: ISellerGig = await updateGig(req.params.gigId, gig);
  res.status(StatusCodes.OK).json({ message: 'Gig update successfully.', gig: updatedGig });
};

const gigUpdateActive = async (req: Request, res: Response): Promise<void> => {
  const updatedGig: ISellerGig = await updateActiveProp(req.params.gigId, req.body.active);
  res.status(StatusCodes.OK).json({ message: 'Gig update successfully.', gig: updatedGig });
};

export { gigUpdate, gigUpdateActive };
