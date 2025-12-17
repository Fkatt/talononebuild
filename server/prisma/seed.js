// Database Seeder
// Creates default user and system settings for immediate usability

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminEmail = 'admin@talonforge.io';
  const adminPassword = 'admin123';

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping...');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'Admin',
      },
    });
    console.log('✅ Created admin user:', admin.email);
  }

  // Create default system settings
  const existingSettings = await prisma.systemSettings.findFirst();

  if (existingSettings) {
    console.log('ℹ️  System settings already exist, skipping...');
  } else {
    const settings = await prisma.systemSettings.create({
      data: {
        aiProvider: 'openai',
        aiConfig: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
        docLinks: {
          talonOne: 'https://docs.talon.one/management-api',
          contentful: 'https://www.contentful.com/developers/docs/references/content-management-api/',
          github: 'https://github.com/talonforge/talonforge',
        },
      },
    });
    console.log('✅ Created system settings');
  }

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Default Credentials:');
  console.log('   Email:', adminEmail);
  console.log('   Password:', adminPassword);
  console.log('');
  console.log('⚠️  Remember to change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
