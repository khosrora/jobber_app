import { Client } from '@elastic/elasticsearch';
import { config } from '@gateway/config';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/helper/logger';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notification elastic search server', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;
  constructor() {
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  public async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        log.info(`gateway service elastic search health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        console.log(error)
        log.error('connection to elastic search faild . retriyng ...');
        log.log('error', 'gateway service checkConnection() method : ', error);
      }
    }
  }
}

export const elasticsearch: ElasticSearch = new ElasticSearch();
