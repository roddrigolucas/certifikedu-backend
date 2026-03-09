/**
 * Seed de fontes — versão cloud-free.
 * Carrega fontes a partir do diretório local ./uploads/fonts/ em vez do S3.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function getFontsFromLocal(fontsDir: string): Promise<Array<string>> {
  const fullPath = path.resolve(fontsDir);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[Seed] Fonts directory "${fullPath}" not found. Skipping font seed.`);
    return [];
  }

  const files = fs.readdirSync(fullPath).filter((f) => f.endsWith('.ttf') || f.endsWith('.otf'));
  return files.map((f) => `fonts/${f}`);
}

function createLoadFontsObjects(fonts: Array<string>): Array<Prisma.FontsCreateInput> {
  const resp: Array<Prisma.FontsCreateInput> = fonts.map((f) => {
    const font = f.split('/').at(-1);
    const category = font.split('.').at(0).split('_').at(-1);
    const family = font.split('_').at(0);

    const fontData: Prisma.FontsCreateInput = {
      family: family,
      category: category,
      ttfUrl: f,
      descDefault: false,
      nameDefault: false,
    };

    if (family === 'AlegreyaSC' && category === 'Regular') {
      fontData.descDefault = true;
    }

    if (family === 'GreatVibes' && category === 'Regular') {
      fontData.nameDefault = true;
    }

    return fontData;
  });

  return resp;
}

export async function loadFonts(prisma: PrismaClient) {
  const fontsData = await getFontsFromLocal('./uploads/fonts');

  if (fontsData.length === 0) {
    console.log('[Seed] No fonts found locally. Skipping font seed.');
    return;
  }

  const fonts = createLoadFontsObjects(fontsData);

  await prisma.fonts.createMany({
    data: fonts,
  });

  console.log(`[Seed] Loaded ${fonts.length} fonts.`);
}
