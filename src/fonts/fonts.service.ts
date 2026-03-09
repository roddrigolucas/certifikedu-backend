import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QBasicFontInfo } from './querys/fonts.querys';
import { TFontBasicOutput } from './types/fonts.types';

@Injectable()
export class FontsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFontsInfo(): Promise<Array<TFontBasicOutput>> {
    return await this.prismaService.fonts.findMany({
      select: QBasicFontInfo,
    });
  }

  async getFontUrlById(fontId: string): Promise<string> {
    const resp = await this.prismaService.fonts.findUnique({
      where: { fontId: fontId },
    });

    if (!resp) {
      return null;
    }

    return resp.fontId;
  }

  async checkFontById(fontId: string): Promise<boolean> {
    const font = await this.prismaService.fonts.findUnique({
      where: { fontId: fontId },
    });

    if (!font) {
      return false;
    }

    return true;
  }
}
