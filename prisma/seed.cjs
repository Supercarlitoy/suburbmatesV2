const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with mock data...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@suburbmates.local' },
    update: {},
    create: {
      email: 'admin@suburbmates.local',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create business owner users
  const businessUsers = [];
  const businessEmails = [
    'mike@mikesplumbing.local',
    'sarah@sarahscafe.local', 
    'info@apexlandscaping.local',
    'luna@lunahair.local',
    'contact@techsolutions.local'
  ];

  for (const email of businessEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        role: 'USER',
      },
    });
    businessUsers.push(user);
    console.log('✅ Created business user:', user.email);
  }

  // Create sample businesses
  const businesses = [
    {
      slug: 'mikes-plumbing-hawthorn',
      name: "Mike's Plumbing",
      abn: '12345678901',
      email: 'mike@mikesplumbing.local',
      bio: 'Professional plumbing services in Hawthorn and surrounding areas. 15+ years experience.',
      suburb: 'Hawthorn',
      serviceAreas: JSON.stringify(['Hawthorn', 'Richmond', 'Kew', 'Camberwell']),
      postcode: '3122',
      phone: '0412 345 678',
      website: 'https://mikesplumbing.local',
      category: 'Home Services',
      status: 'APPROVED',
      themeId: 'corporate-blue',
      layoutId: 'standard',
      headerStyle: 'standard',
      ctaText: 'Get Quote',
      userId: businessUsers[0].id,
    },
    {
      slug: 'sarahs-cafe-richmond',
      name: "Sarah's Cafe",
      abn: '23456789012',
      email: 'sarah@sarahscafe.local',
      bio: 'Cozy neighborhood cafe serving the best coffee and pastries in Richmond.',
      suburb: 'Richmond',
      serviceAreas: JSON.stringify(['Richmond', 'Fitzroy', 'Collingwood']),
      postcode: '3121',
      phone: '0423 456 789',
      website: 'https://sarahscafe.local',
      category: 'Food & Beverage',
      status: 'APPROVED',
      themeId: 'warm-orange',
      layoutId: 'modern',
      headerStyle: 'centered',
      ctaText: 'Visit Us',
      userId: businessUsers[1].id,
    },
    {
      slug: 'apex-landscaping-kew',
      name: 'Apex Landscaping',
      abn: '34567890123',
      email: 'info@apexlandscaping.local',
      bio: 'Transform your outdoor space with professional landscaping and garden design.',
      suburb: 'Kew',
      serviceAreas: JSON.stringify(['Kew', 'Hawthorn', 'Balwyn', 'Canterbury']),
      postcode: '3101',
      phone: '0434 567 890',
      website: 'https://apexlandscaping.local',
      category: 'Home & Garden',
      status: 'APPROVED',
      themeId: 'nature-green',
      layoutId: 'gallery',
      headerStyle: 'overlay',
      ctaText: 'Get Estimate',
      userId: businessUsers[2].id,
    },
    {
      slug: 'luna-hair-studio-fitzroy',
      name: 'Luna Hair Studio',
      abn: '45678901234',
      email: 'luna@lunahair.local',
      bio: 'Modern hair salon offering cuts, colors, and styling in trendy Fitzroy.',
      suburb: 'Fitzroy',
      serviceAreas: JSON.stringify(['Fitzroy', 'Collingwood', 'Carlton', 'Richmond']),
      postcode: '3065',
      phone: '0445 678 901',
      website: 'https://lunahair.local',
      category: 'Beauty & Wellness',
      status: 'APPROVED',
      themeId: 'elegant-purple',
      layoutId: 'minimal',
      headerStyle: 'split',
      ctaText: 'Book Now',
      userId: businessUsers[3].id,
    },
    {
      slug: 'tech-solutions-melbourne',
      name: 'Tech Solutions Melbourne',
      abn: '56789012345',
      email: 'contact@techsolutions.local',
      bio: 'IT support and computer repair services for homes and small businesses.',
      suburb: 'Melbourne',
      serviceAreas: JSON.stringify(['Melbourne', 'South Melbourne', 'Port Melbourne', 'Southbank']),
      postcode: '3000',
      phone: '0456 789 012',
      website: 'https://techsolutions.local',
      category: 'Technology',
      status: 'PENDING',
      themeId: 'tech-blue',
      layoutId: 'standard',
      headerStyle: 'standard',
      ctaText: 'Contact Us',
      userId: businessUsers[4].id,
    },
  ];

  for (const businessData of businesses) {
    const business = await prisma.business.upsert({
      where: { slug: businessData.slug },
      update: {},
      create: businessData,
    });
    console.log('✅ Created business:', business.name);

    // Create sample content for each business
    await prisma.content.upsert({
      where: { 
        id: `${business.id}-welcome`
      },
      update: {},
      create: {
        businessId: business.id,
        title: 'Welcome Post',
        text: `Welcome to ${business.name}! We're excited to serve the ${business.suburb} community.`,
        images: JSON.stringify([]),
        tags: JSON.stringify([]),
        isPublic: true,
      },
    });
  }

  // Create sample leads
  const approvedBusinesses = await prisma.business.findMany({
    where: { status: 'APPROVED' },
  });

  const sampleLeads = [
    {
      name: 'John Smith',
      email: 'john@example.local',
      phone: '0412 123 456',
      message: 'Hi, I need a plumber to fix a leaky tap in my kitchen. When are you available?',
    },
    {
      name: 'Emma Wilson',
      email: 'emma@example.local',
      phone: '0423 234 567',
      message: 'Looking for a good coffee shop for my morning routine. Do you have oat milk?',
    },
    {
      name: 'David Chen',
      email: 'david@example.local',
      phone: '0434 345 678',
      message: 'Interested in landscaping my backyard. Can you provide a quote?',
    },
  ];

  for (let i = 0; i < sampleLeads.length && i < approvedBusinesses.length; i++) {
    const lead = await prisma.lead.create({
      data: {
        ...sampleLeads[i],
        businessId: approvedBusinesses[i].id,
        status: 'NEW',
      },
    });
    console.log('✅ Created lead for:', approvedBusinesses[i].name);
  }

  console.log('🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Businesses: ${await prisma.business.count()}`);
  console.log(`- Content: ${await prisma.content.count()}`);
  console.log(`- Leads: ${await prisma.lead.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });