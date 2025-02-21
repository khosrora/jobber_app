import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@chat/config';
import { winstonLogger } from '@chat/helper/logger';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat elastic search server', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`chat service elastic search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('connection to elastic search faild . retriyng ...');
      log.log('error', 'chat service checkConnection() method : ', error);
    }
  }
};

export { checkConnection };
