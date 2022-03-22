import { Module } from '@nestjs/common';
import { PersistenceService } from './persistence.service';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://localhost:9200',
      }),
    }),
  ],
  providers: [PersistenceService, SearchService],
  exports: [PersistenceService, SearchService],
})
export class PersistenceModule {}
