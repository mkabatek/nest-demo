import { Module } from '@nestjs/common';
import { PersistenceService } from './persistence.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://my-domain.us-east-1.es.localhost.localstack.cloud:4566'
      })
    })
  ],
  providers: [PersistenceService],
  exports: [PersistenceService],
})
export class PersistenceModule {}
