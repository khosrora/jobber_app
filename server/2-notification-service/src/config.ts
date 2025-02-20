import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public NODE_ENV: string | undefined;
  public CLINET_URL: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.CLINET_URL = process.env.CLINET_URL || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
  }
}

export const config: Config = new Config();
