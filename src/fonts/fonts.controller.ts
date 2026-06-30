// fonts.controller.ts
import { Controller, Get } from '@nestjs/common';
import { FontsService } from './fonts.service';
import { TFontBasicOutput } from './types/fonts.types';

@Controller('fonts')
export class FontsController {
  constructor(private readonly fontsService: FontsService) {}

  @Get()
  async getAllFonts(): Promise<TFontBasicOutput[]> {
    return await this.fontsService.getFontsInfo();
  }
}