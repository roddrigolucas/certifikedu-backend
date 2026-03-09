import { Abilities, PrismaClient, PrismaPromise } from '@prisma/client';
import * as fs from 'fs';

async function abilitiesWgu(prisma: PrismaClient, querys: Array<PrismaPromise<Abilities>>) {
  const jsonPath = './prisma/seed-files/data/wgu_habilidades_seed.json';
  const data = fs.readFileSync(jsonPath, 'utf8');

  const abilities: [string, string][] = [];
  const jsonData = JSON.parse(data);
  for (const key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      const values = jsonData[key];
      for (const value of values) {
        abilities.push([key, value]);
      }
    }
  }

  abilities.map(([theme, name]) => {
    querys.push(
      prisma.abilities.create({
        data: {
          tema: theme,
          habilidade: name,
        },
      }),
    );
  });
}

async function newAbFac(prisma: PrismaClient, querys: Array<PrismaPromise<Abilities>>) {
  const jsonPath = './prisma/seed-files/data/new_ab.json';

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(fileData) as Record<string, Array<{ [key: string]: string[] }>>;

  for (const source of Object.keys(data)) {
    const categories = data[source];

    for (const category of categories) {
      for (const tema in category) {
        const habilidades = category[tema];

        for (const habilidade of habilidades) {
          querys.push(
            prisma.abilities.create({
              data: {
                source: source,
                tema: tema,
                habilidade: habilidade,
              },
            }),
          );
        }
      }
    }
  }
}

async function abilitiesCne(prisma: PrismaClient, querys: Array<PrismaPromise<Abilities>>) {
  const jsonPath = './prisma/seed-files/data/cne_hab.json';

  const fileData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(fileData) as Record<string, Array<{ [key: string]: string[] }>>;

  for (const source of Object.keys(data)) {
    const categories = data[source];

    for (const category of categories) {
      for (const tema in category) {
        const habilidades = category[tema];

        for (const habilidade of habilidades) {
          querys.push(
            prisma.abilities.create({
              data: {
                source: source,
                tema: tema,
                habilidade: habilidade,
              },
            }),
          );
        }
      }
    }
  }
}

export async function populateAbilities(prisma: PrismaClient) {
  const querys: Array<PrismaPromise<Abilities>> = [];

  try {
    abilitiesWgu(prisma, querys)
    newAbFac(prisma, querys)
    abilitiesCne(prisma, querys)
    await prisma.$transaction(querys);
  } catch (error) {
    console.error('An error occurred while inserting abilities data:', error);
  }
}


