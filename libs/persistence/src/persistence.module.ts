import { Module } from '@nestjs/common';
import { PersistenceService } from './persistence.service';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://fungyproof-es-dev.us-east-1.es.localhost.localstack.cloud:4566',
      }),
    }),
  ],
  providers: [PersistenceService, SearchService],
  exports: [PersistenceService, SearchService],
})
export class PersistenceModule {}
