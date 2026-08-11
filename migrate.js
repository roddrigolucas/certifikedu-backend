const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function runMigration() {
  let awsPrisma;
  let localPrisma;

  try {
    const password = 'Cateto26';
    // AWS RDS Connection
    const awsDbUrl = `postgresql://postgres:${encodeURIComponent(password)}@database-1.cfpa5thrzo8h.us-east-1.rds.amazonaws.com:5432/nest?schema=public`;
    awsPrisma = new PrismaClient({ datasources: { db: { url: awsDbUrl } } });
    console.log('Connected to AWS RDS database.');

    // Local / VPS Database Connection
    const localDbUrl = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5434/nest?schema=public';
    localPrisma = new PrismaClient({ datasources: { db: { url: localDbUrl } } });
    console.log('Connected to Local/VPS database.');

    // 1. Fetch Users from AWS
    console.log('Fetching users from AWS RDS...');
    const awsUsers = await awsPrisma.user.findMany();
    console.log(`Fetched ${awsUsers.length} users.`);

    // 1b. Fetch AuthCredentials from AWS
    console.log('Fetching auth_credentials from AWS RDS...');
    const awsAuths = await awsPrisma.authCredentials.findMany();
    console.log(`Fetched ${awsAuths.length} auth credentials.`);

    console.log('Migrating users to local database...');
    let usersMigrated = 0;
    for (const user of awsUsers) {
      try {
        await localPrisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
        usersMigrated++;
      } catch (e) {
        console.error(`Failed to migrate user ${user.id}:`, e.message);
      }
    }
    console.log(`Migrated ${usersMigrated}/${awsUsers.length} users successfully.`);

    console.log('Migrating auth credentials to local database...');
    let authsMigrated = 0;
    for (const auth of awsAuths) {
      try {
        await localPrisma.authCredentials.upsert({
          where: { userId: auth.userId },
          update: auth,
          create: auth,
        });
        authsMigrated++;
      } catch (e) {
        console.error(`Failed to migrate auth for user ${auth.userId}:`, e.message);
      }
    }
    console.log(`Migrated ${authsMigrated}/${awsAuths.length} auth credentials successfully.`);

    console.log('Migration completed.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (awsPrisma) await awsPrisma.$disconnect();
    if (localPrisma) await localPrisma.$disconnect();
  }
}

runMigration();
