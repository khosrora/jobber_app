import { Client } from '@elastic/elasticsearch';
import { config } from '@gig/config';
import { Logger } from 'winston';
import { winstonLogger } from '@gig/helper/logger';
import { ClusterHealthResponse, CountResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { ISellerGig } from '@gig/helper/gig.interface';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig elastic search server', 'debug');

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;
  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`gig service elastic search health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('connection to elastic search faild . retriyng ...');
      log.log('error', 'gig service checkConnection() method : ', error);
    }
  }
};

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

const getDocumentCount = async (index: string): Promise<number> => {
  try {
    const result: CountResponse = await elasticSearchClient.count({ index });
    return result.count;
  } catch (error) {
    log.log('error', 'gigService elastic search getIndexedData() method error', error);
    return 0;
  }
};

const getIndexedData = async (index: string, itemId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({ index, id: itemId });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'gigService elastic search getIndexedData() method error', error);
    return {} as ISellerGig;
  }
};

const addDataToIndex = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.index({
      index,
      id: itemId,
      document: gigDocument
    });
  } catch (error) {
    log.log('error', 'gigService elastic search addDataToIndex() method error', error);
  }
};

const updateIndexData = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.update({
      index,
      id: itemId,
      doc: gigDocument
    });
  } catch (error) {
    log.log('error', 'gigService elastic search updateIndexData() method error', error);
  }
};

const deleteIndexData = async (index: string, itemId: string): Promise<void> => {
  try {
    await elasticSearchClient.delete({
      index,
      id: itemId
    });
  } catch (error) {
    log.log('error', 'gigService elastic search deleteIndexData() method error', error);
  }
};

export {
  elasticSearchClient,
  checkConnection,
  createIndex,
  getIndexedData,
  addDataToIndex,
  updateIndexData,
  deleteIndexData,
  getDocumentCount
};
