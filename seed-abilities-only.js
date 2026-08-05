
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const abilities = [
  { tema: 'Tecnologia', habilidade: 'JavaScript' },
  { tema: 'Tecnologia', habilidade: 'Node.js' },
  { tema: 'Tecnologia', habilidade: 'Python' },
  { tema: 'Tecnologia', habilidade: 'React' },
  { tema: 'Tecnologia', habilidade: 'TypeScript' },
  { tema: 'Gestao', habilidade: 'Gestao de Projetos' },
  { tema: 'Gestao', habilidade: 'Lideranca' },
  { tema: 'Gestao', habilidade: 'Comunicacao' },
  { tema: 'Marketing', habilidade: 'Marketing Digital' },
  { tema: 'Marketing', habilidade: 'SEO' },
  { tema: 'Design', habilidade: 'UX/UI Design' },
  { tema: 'Design', habilidade: 'Figma' },
  { tema: 'Dados', habilidade: 'Analise de Dados' },
  { tema: 'Dados', habilidade: 'Excel Avancado' },
  { tema: 'Seguranca', habilidade: 'Seguranca da Informacao' },
];

async function main() {
  console.log('Inserindo habilidades...');
  let count = 0;
  for (const ab of abilities) {
    try {
      const existing = await prisma.abilities.findFirst({
        where: { habilidade: ab.habilidade },
      });
      if (!existing) {
        await prisma.abilities.create({ data: { tema: ab.tema, habilidade: ab.habilidade } });
        count++;
        console.log(`  [+] ${ab.habilidade} (${ab.tema})`);
      } else {
        console.log(`  [~] ${ab.habilidade} ja existe`);
      }
    } catch (err) {
      console.error(`  [!] Erro ao inserir ${ab.habilidade}:`, err.message);
    }
  }
  console.log(`\nTotal inseridas: ${count}/${abilities.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
