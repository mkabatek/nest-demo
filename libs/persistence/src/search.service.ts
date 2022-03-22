import { IndicesPutMapping } from '@elastic/elasticsearch/api/requestParams';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
// import * as dot from 'dot-object';

//import { ServiceError } from '@app/shared';
//import { Logger } from '@app/logger';

export type SearchPayload = {
  size: number;
  // "query": "(content:this OR name:this) AND (content:that OR name:that)"
  query?: string;
  // TODO size/from is limited to 10k results will need
  // to implement `search_after` once we hit that number
  from?: number;
  sort?: { [key: string]: 'asc' | 'desc' };
};

@Injectable()
export class SearchService {
  constructor(
    //private readonly log: Logger,
    public readonly esSvc: ElasticsearchService,
  ) {}

  public async ping() {
    const { body } = await this.esSvc.ping();
    return body;
  }

  /**
   * Refresh an index
   * @param index
   * @returns
   */
  public async refreshIndex(index: string): Promise<any> {
    return this.esSvc.indices.refresh({ index });
  }

  /**
   * Check if index exists
   *
   * @param index
   */
  public async indexExists(index: string): Promise<boolean> {
    const { body } = await this.esSvc.indices.exists({ index });
    return body;
  }

  /**
   * Create index if not exists
   *
   * @param index
   */
  public async createIndex(
    index: string,
    mapping?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const exists = await this.indexExists(index);
      if (exists) {
        return true;
      }
      await this.esSvc.indices.create({ index });

      if (mapping) {
        await this.esSvc.indices.putMapping({
          index,
          body: mapping,
        } as IndicesPutMapping);
      }
      return true;
    } catch (err) {
      //this.log.error('[ElasticService:createIndex]', err.stack)
      return false;
    }
  }

  /**
   * Create a document
   *
   * @param index
   * @param body
   * @param id?
   * @param opts
   */
  public async createDocument(
    index: string,
    data: any,
    id?: string,
    opts: any = {},
  ) {
    const { body } = await this.esSvc.index({
      index,
      id,
      body: data,
      refresh: 'wait_for',
      ...opts,
    });

    return body;
  }

  /**
   * Update or create document
   * with a known ID
   *
   * @param index
   * @param body
   * @param id
   * @param opts
   */
  public async upsertDocument(
    index: string,
    data: any,
    id: string,
    opts: any = {},
  ) {
    const { body } = await this.esSvc.update({
      index,
      id,
      refresh: 'wait_for',
      body: {
        doc: data,
        doc_as_upsert: true,
      },
      retry_on_conflict: 1,
      ...opts,
    });

    return body;
  }

  /**
   * Update documents via query
   *
   * @param index
   * @param data
   * @param query
   */
  public async updateByQuery(
    index: string,
    script: string | Record<string, any>,
    query: string,
  ) {
    const result = await this.esSvc.updateByQuery({
      index,
      refresh: true,
      body: {
        script,
        query: {
          query_string: { query },
        },
      },
    });

    return result;
  }

  /**
   * Get a document by id
   *
   * @param index
   * @param query
   * @returns
   */
  public async getDocument(index: string, id: string, fields?: string[]) {
    const request: any = {
      index,
      id,
    };

    if (fields) {
      request._source = fields;
    }

    try {
      const { body } = await this.esSvc.get(request);
      return body?._source;
    } catch (err) {
      // this.log.warn(`[SearchService:getDocument] ${err.stack}`)
      return null;
    }
  }

  /**
   * Search for documents
   *
   * @param index
   * @param payload
   * @param page
   * @returns
   */
  public async queryDocuments(index: string, payload: SearchPayload, page = 1) {
    // set default sort
    payload.sort = payload.sort ? payload.sort : { _id: 'desc' };
    payload.from = (payload.size || 9) * (page - 1);
    const { body } = await this.esSvc.search({
      index,
      body: {
        ...payload,
        query: payload.query
          ? {
              query_string: {
                query: payload.query,
                analyzer: 'standard',
                analyze_wildcard: true,
              },
            }
          : undefined,
      },
    });

    return {
      // TODO how do we know we are at the end?
      page,
      total: body?.hits?.total?.value,
      items: body.hits?.hits?.map((i) => ({ _id: i._id, ...i._source })),
    };
  }
}
