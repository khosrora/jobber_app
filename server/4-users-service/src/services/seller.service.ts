import { IOrderMessage } from '@users/helper/order.interface';
import { IRatingTypes, IReviewMessageDetails } from '@users/helper/review.interface';
import { ISellerDocument } from '@users/helper/seller.interface';
import { sellerModel } from '@users/models/seller.schema';
import { updateBuyerIsSellerProp } from '@users/services/buyer.service';
import mongoose from 'mongoose';

const getSellerById = async (sellerId: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await sellerModel
    .findOne({ _id: new mongoose.Types.ObjectId(sellerId) })
    .exec()) as ISellerDocument;
  return seller;
};

const getSellerByUsername = async (username: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await sellerModel.findOne({ username }).exec()) as ISellerDocument;
  return seller;
};

const getSellerByEmail = async (email: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await sellerModel.findOne({ email }).exec()) as ISellerDocument;
  return seller;
};

const getRandomSellers = async (size: number): Promise<ISellerDocument[]> => {
  const buyers: ISellerDocument[] = await sellerModel.aggregate([{ $sample: { size } }]);
  return buyers;
};

const createSeller = async (sellerData: ISellerDocument): Promise<ISellerDocument> => {
  const createdSeller: ISellerDocument = (await sellerModel.create(sellerData)) as ISellerDocument;
  await updateBuyerIsSellerProp(`${createdSeller.email}`);
  return createdSeller;
};

const updateSeller = async (sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument> => {
  const updatedSeller: ISellerDocument = (await sellerModel
    .findOneAndUpdate(
      { _id: sellerId },
      {
        $set: {
          profilePublicId: sellerData.profilePublicId,
          fullName: sellerData.fullName,
          profilePicture: sellerData.profilePicture,
          description: sellerData.description,
          country: sellerData.country,
          skills: sellerData.skills,
          oneliner: sellerData.oneliner,
          languages: sellerData.languages,
          responseTime: sellerData.responseTime,
          experience: sellerData.experience,
          education: sellerData.education,
          socialLinks: sellerData.socialLinks,
          certificates: sellerData.certificates
        }
      },
      { new: true }
    )
    .exec()) as ISellerDocument;
  return updatedSeller;
};

const updateTotalGigsCount = async (sellerId: string, count: number): Promise<void> => {
  await sellerModel.updateOne({ _id: sellerId }, { $inc: { totalGigs: count } }).exec();
};

const updateSellerOnGoingJobsProp = async (sellerId: string, ongoingJobs: number): Promise<void> => {
  await sellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs } }).exec();
};

const updateSellerCancelledJobsProp = async (sellerId: string): Promise<void> => {
  await sellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs: -1, cancelledJobs: 1 } }).exec();
};

const updateSellerCompletedJobsProp = async (data: IOrderMessage): Promise<void> => {
  const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;
  await sellerModel
    .updateOne(
      { _id: sellerId },
      {
        $inc: { ongoingJobs, completedJobs, totalEarnings },
        $set: { recentDelivery: new Date(recentDelivery!) }
      }
    )
    .exec();
};

const updateSellerReview = async (data: IReviewMessageDetails): Promise<void> => {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };
  const ratingKey: string = ratingTypes[`${data.rating}`];
  await sellerModel
    .updateOne(
      { _id: data.sellerId },
      {
        $inc: {
          ratingsCount: 1,
          ratingSum: data.rating,
          [`ratingCategories.${ratingKey}.value`]: data.rating,
          [`ratingCategories.${ratingKey}.count`]: 1
        }
      }
    )
    .exec();
};

export {
  createSeller,
  getRandomSellers,
  getSellerByEmail,
  getSellerById,
  getSellerByUsername,
  updateSeller,
  updateSellerOnGoingJobsProp,
  updateTotalGigsCount,
  updateSellerCompletedJobsProp,
  updateSellerReview,
  updateSellerCancelledJobsProp
};
