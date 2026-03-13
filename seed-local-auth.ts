import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    let password = 'Password123!';
    if (user.email === 'admin@certifikedu.com' || user.email === 'guil.dendena@gmail.com') {
      password = 'Admin123!';
    } else if (user.email.includes('teste')) {
      password = 'Teste123!';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert or update in auth_credentials
    await prisma.$executeRawUnsafe(
      `INSERT INTO auth_credentials (email, password_hash, user_type, status) VALUES ($1, $2, $3, 'CONFIRMED') ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      user.email,
      hashedPassword,
      user.type
    );
    
    console.log(`Updated credentials for ${user.email} (Password: ${password})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
