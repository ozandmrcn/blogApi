import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Health check used by the process manager to decide the service is up. */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
