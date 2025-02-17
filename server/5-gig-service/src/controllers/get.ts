import { ISellerGig } from '@gig/helper/gig.interface';
import { ISearchResult } from '@gig/helper/search.interface';
import { getUserSelectedCategory } from '@gig/redis/gig.cache';
import { getGigById, getSellerGigs, getSellerPausedGigs } from '@gig/services/gig.service';
import { getMoreGigsLikeThis, getTopRatedGigsByCategory, gigsSearchByCategory } from '@gig/services/search.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const gigById = async (req: Request, res: Response): Promise<void> => {
  const gig: ISellerGig = await getGigById(req.params.id);
  res.status(StatusCodes.OK).json({ message: 'Get gig by id', gig });
};

const sellerGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs });
};

const sellerInactiveGigs = async (req: Request, res: Response): Promise<void> => {
  const gigs: ISellerGig[] = await getSellerPausedGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Seller gigs', gigs });
};

const topRatedGigsByCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await getUserSelectedCategory(`selectedCategories:${req.params.username}`);
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await getTopRatedGigsByCategory(`${category}`);
  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }
  res.status(StatusCodes.OK).json({ message: 'search top gigs results', total: gigs.total, gigs: resultHits });
};

const gigsByCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await getUserSelectedCategory(`selectedCategories:${req.params.username}`);
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await gigsSearchByCategory(`${category}`);
  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }
  res.status(StatusCodes.OK).json({ message: 'search gigs category results', total: gigs.total, gigs: resultHits });
};

const moreLikeThis = async (req: Request, res: Response): Promise<void> => {
  const resultHits: ISellerGig[] = [];
  const gigs: ISearchResult = await getMoreGigsLikeThis(req.params.gigId);
  for (const item of gigs.hits) {
    resultHits.push(item._source as ISellerGig);
  }
  res.status(StatusCodes.OK).json({ message: 'More gigs like this', total: gigs.total, gigs: resultHits });
};

export { gigById, sellerGigs, sellerInactiveGigs, topRatedGigsByCategory, gigsByCategory, moreLikeThis };
