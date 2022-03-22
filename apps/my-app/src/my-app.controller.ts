import { Controller, Get } from '@nestjs/common';
import { MyAppService } from './my-app.service';
import { SearchService } from '@app/persistence/search.service';

@Controller()
export class MyAppController {
  constructor(
    private readonly myAppService: MyAppService,
    private readonly searchService: SearchService,
  ) {}

  @Get('ping')
  async getHello(): Promise<boolean> {
    return await this.searchService.ping();
  }
}
