import axios, { AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';
import { ISellerDocument } from '@gateway/helper/seller.interface';

export let axiosSellerInstance: ReturnType<typeof axios.create>;

class SellerService {
  axiosService: AxiosService;
  constructor() {
    this.axiosService = new AxiosService(`${config.USERS_BASE_URL}/api/v1/seller`, 'seller');
    axiosSellerInstance = this.axiosService.axios;
  }

  getSellerById = async (sellerId: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.get(`/id/${sellerId}`);
    return response;
  };

  getSellerByUsernamr = async (username: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.get(`/username/${username}`);
    return response;
  };

  getRandomSellers = async (size: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.get(`/random/${size}`);
    return response;
  };

  createSeller = async (body: ISellerDocument): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.post(`/create`, body);
    return response;
  };

  updateSeller = async (sellerId: string, body: ISellerDocument): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.put(`/${sellerId}`, body);
    return response;
  };

  seed = async (count: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosSellerInstance.put(`/seed/${count}`);
    return response;
  };
}

export const sellerService: SellerService = new SellerService();
