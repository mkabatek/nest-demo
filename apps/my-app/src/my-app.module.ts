import { Module } from '@nestjs/common';
import { MyAppController } from './my-app.controller';
import { MyAppService } from './my-app.service';
import { PersistenceModule } from '@app/persistence';

@Module({
  imports: [PersistenceModule],
  controllers: [MyAppController],
  providers: [MyAppService],
})
export class MyAppModule {}
