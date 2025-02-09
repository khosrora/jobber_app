import { Client } from '@elastic/elasticsearch';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { winstonLogger } from '@notifications/helper/logger';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notification elastic search server', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`notification service elastic search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('connection to elastic search faild . retriyng ...');
      log.log('error', 'notification service checkConnection() method : ', error);
    }
  }
}
