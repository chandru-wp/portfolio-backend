// Sample data seeder for MongoDB
// Run this file to populate your database with sample projects

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    await prisma.$transaction([
      prisma.portfolio.deleteMany({}),
      prisma.user.deleteMany({}),
      prisma.profile.deleteMany({}),
      prisma.skillGroup.deleteMany({}),
      prisma.experience.deleteMany({}),
      prisma.education.deleteMany({}),
    ]);

    // Create a sample user first
    const user = await prisma.user.create({
      data: {
        username: 'demo',
        password: 'demo123',
        role: 'admin'
      }
    });

    console.log('✅ Created user:', user.username);

    // Profile
    const profile = await prisma.profile.create({
      data: {
        name: 'Sibi Siddharth S',
        email: 'sibisiddharth8@gmail.com',
        phone: '+91 9629124660',
        about: 'Full Stack Developer with expertise in React, Node.js, AI/ML, and Cloud technologies. Currently pursuing B.Tech in AI & Data Science at Kathir College of Engineering with CGPA 8.3.'
      }
    });

    console.log('✅ Created profile for:', profile.name);

    // Skill groups
    const skillGroups = [
      { category: 'frontend', items: ['React', 'Vite', 'Tailwind CSS', 'TypeScript', 'HTML', 'CSS', 'JavaScript'], order: 1 },
      { category: 'backend', items: ['Node.js', 'Express.js', 'Python', 'Flask', 'Firebase'], order: 2 },
      { category: 'database', items: ['MongoDB', 'Prisma', 'PostgreSQL'], order: 3 },
      { category: 'cloud', items: ['GCP (Google Cloud Platform)', 'Azure'], order: 4 },
      { category: 'aiml', items: ['Machine Learning', 'Deep Learning', 'Data Science', 'AI Model Development'], order: 5 }
    ];

    await prisma.skillGroup.createMany({ data: skillGroups });
    console.log('✅ Created skill groups');

    // Experience
    const experience = [
      {
        role: 'Full Stack Intern',
        company: 'IBACUS-TECH Solutions',
        duration: 'Jul 2025 – Aug 2025',
        description: 'Contributed to multiple full-stack applications with ReactJS, Node.js, Express, SQL & MongoDB',
        tech: ['React', 'Node.js', 'MongoDB', 'Express', 'SQL'],
        order: 1
      },
      {
        role: 'Software Developer',
        company: 'Izet e-Payments',
        duration: 'Feb 2025 – May 2025',
        description: 'Built internal ticketing system with reusable UI modules & secure backend APIs',
        tech: ['React', 'Prisma', 'Node.js'],
        order: 2
      }
    ];

    await prisma.experience.createMany({ data: experience });
    console.log('✅ Created experience entries');

    // Education
    const education = [
      {
        degree: 'B.Tech – AI & Data Science',
        institution: 'Kathir College of Engineering',
        year: '2025',
        cgpa: '8.3',
        highlights: ['Machine Learning', 'Deep Learning', 'Algorithms', 'ReactJS', 'Data Science'],
        order: 1
      },
      {
        degree: 'HSC – Computer Science',
        institution: 'Kovai Public School',
        year: '2021',
        highlights: ['Mathematics', 'Computer Science'],
        order: 2
      }
    ];

    await prisma.education.createMany({ data: education });
    console.log('✅ Created education entries');

    // Projects (reuse Portfolio)
    const projects = [
      {
        userId: user.id,
        title: 'UptimeEye',
        description: 'A comprehensive site monitoring application that tracks website uptime and performance',
        github: 'https://github.com/username/uptimeeye',
        website: 'https://uptimeeye.com'
      },
      {
        userId: user.id,
        title: 'Rydirect',
        description: 'Professional links management platform for organizing and sharing multiple links efficiently',
        github: 'https://github.com/username/rydirect',
        website: 'https://rydirect.com'
      },
      {
        userId: user.id,
        title: 'MyMind | Nyra.ai',
        description: 'AI-powered portfolio builder that presents projects professionally with ML recommendations',
        github: 'https://github.com/username/mymind',
        website: 'https://mymind.ai'
      },
      {
        userId: user.id,
        title: 'Full Stack Portfolio',
        description: 'Modern portfolio website with authentication, admin dashboard, and dynamic content management',
        github: 'https://github.com/username/portfolio',
        website: 'https://portfolio.example.com'
      }
    ];

    await prisma.portfolio.createMany({ data: projects });
    console.log('✅ Created projects');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users created: 1`);
    console.log(`- Profile created: 1`);
    console.log(`- Skill groups: ${skillGroups.length}`);
    console.log(`- Experience entries: ${experience.length}`);
    console.log(`- Education entries: ${education.length}`);
    console.log(`- Projects created: ${projects.length}`);
    console.log('\n🔐 Demo Credentials:');
    console.log('Username: demo');
    console.log('Password: demo123');
    console.log('Role: admin');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDatabase();
