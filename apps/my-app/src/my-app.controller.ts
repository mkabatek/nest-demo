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

  @Get('post')
  async index(): Promise<any> {
    return await this.searchService.post();
  }

  @Get('search')
  async exists(): Promise<any> {
    return await this.searchService.indexExists('game-of-thrones');
  }
}
