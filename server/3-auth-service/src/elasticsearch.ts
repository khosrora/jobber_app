import { Client } from '@elastic/elasticsearch';
import { config } from '@auth/config';
import { Logger } from 'winston';
import { winstonLogger } from '@auth/helper/logger';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { ISellerGig } from '@auth/helper/gig.interface';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth elastic search server', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

async function checkConnection(): Promise<void> {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`auth service elastic search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('connection to elastic search faild . retriyng ...');
      log.log('error', 'auth service checkConnection() method : ', error);
    }
  }
}

async function checkIfInexExist(indexName: string): Promise<boolean> {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
}

async function createIndex(indexName: string): Promise<void> {
  try {
    const result: boolean = await checkIfInexExist(indexName);
    if (result) {
      log.info(`Index '${indexName}' already exist.`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });

      log.info(`Created index ${indexName}`);
    }
  } catch (error) {
    log.error(`an error occurred whie creating the index ${indexName}`);
    log.log('error', 'auth service elasticsearch createIndex() method : ', error);
  }
}

async function getDocumentById(index: string, gigId: string): Promise<ISellerGig> {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: gigId
    });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'auth service elasticsearch getDocumentById() method : ', error);
    return {} as ISellerGig;
  }
}

export { elasticSearchClient, checkConnection, createIndex, getDocumentById };
