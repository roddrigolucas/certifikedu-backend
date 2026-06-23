import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function debugLogin() {
  const email = 'r.lucas@fiemg.com.br';
  const password = 'Password123!';
  const jwtSecret = 'certifikedu-local-secret-change-in-production-2024';

  console.log('--- Debug Login Start ---');

  try {
    // 1. Check credentials
    console.log('Checking credentials...');
    const credentials: any = await prisma.$queryRawUnsafe(`SELECT * FROM auth_credentials WHERE email = $1`, email);
    
    if (!credentials || credentials.length === 0) {
      console.log('User not found in auth_credentials');
      return;
    }

    const isValid = await bcrypt.compare(password, credentials[0].password_hash);
    console.log('Password valid:', isValid);

    if (!isValid) return;

    // 2. Get user
    console.log('Getting user record...');
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User record:', JSON.stringify(user, null, 2));

    if (!user) {
      console.log('User record not found in users table');
      return;
    }

    // 3. Simulated JWT signing (to avoid module issues in script)
    console.log('Simulating JWT signing...');
    const token = 'debug-token-' + Date.now();
    console.log('Token generated:', token);

    // 4. Create Session
    console.log('Creating session step...');
    try {
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token: token,
          isActive: true,
        },
      });
      console.log('Session created successfully:', session.id);
    } catch (sessionError) {
      console.error('FAILED TO CREATE SESSION:');
      console.error(sessionError);
      throw sessionError;
    }

  } catch (error) {
    console.error('--- ERROR CAUGHT ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('--- Debug Login End ---');
  }
}

debugLogin();
