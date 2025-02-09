import axios, { AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';

export let axiosBuyerInstance: ReturnType<typeof axios.create>;

class BuyerService {
  axiosService: AxiosService;
  constructor() {
    this.axiosService = new AxiosService(`${config.USERS_BASE_URL}/api/v1/buyer`, 'buyer');
    axiosBuyerInstance = this.axiosService.axios;
  }

  getCurrentBuyerByUsername = async (): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosBuyerInstance.get(`/username`);
    return response;
  };

  getBuyerByUsername = async (username: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosBuyerInstance.get(`/${username}`);
    return response;
  };

  getBuyerByEmail = async (email: string): Promise<AxiosResponse> => {
    const response: AxiosResponse = await axiosBuyerInstance.get(`/${email}`);
    return response;
  };
}

export const buyerService: BuyerService = new BuyerService();
