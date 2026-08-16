const connectDB = require('../src/config/db');
const Card = require('../src/models/Card');

async function seed() {
  await connectDB();

  const count = await Card.countDocuments();
  if (count === 0) {
    const sampleCards = [
      {
        title: 'Executive Smart Pass',
        cardType: 'executive',
        orientation: 'horizontal',
        status: 'active',
        isVerified: true,
        issuedBy: 'JobHive Official Identity Authority',
        personal: {
          fullName: 'Alex Rivera',
          preferredName: 'Alex',
          jobTitle: 'Lead AI Engineer & Architect',
          organization: 'JobHive Technologies',
          department: 'Autonomous AI Labs',
          idNumber: 'JHV-9048-X',
          validUntil: '12/2028',
          bloodGroup: 'O+',
          emergencyContact: '+91 98765 43210',
          bio: 'Architecting neural synthesis platforms, cloud systems, and next-gen identity runtimes.',
          tagline: 'Building the Future of Digital Identity',
          skills: ['Artificial Intelligence', 'Full Stack MERN', 'System Architecture', 'Cloud Infrastructure'],
        },
        media: {
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
          avatarType: 'image',
        },
        contact: {
          email: 'alex.rivera@jobhive.app',
          phone: '+91 98765 43210',
          website: 'https://jobhive.app',
          location: 'Delhi NCR, India',
          address: 'Cyber City, Gurugram, Haryana',
        },
        socials: {
          github: 'alexrivera-ai',
          linkedin: 'alexrivera-tech',
          twitter: 'alexrivera_ai',
        },
        security: {
          barcodeNumber: '984021948301',
          hasSecurityChip: true,
          hasNfcSymbol: true,
          hasHologramStamp: true,
          hasMagneticStripe: true,
          hasSignatureStrip: true,
          badgeLabel: 'VERIFIED EXECUTIVE',
          badgeType: 'verified',
        },
        theme: {
          themeId: 'cyberpunk',
          isCustom: false,
        },
        qrSettings: {
          targetType: 'verify',
          fgColor: '#00f0ff',
          bgColor: 'transparent',
        },
        analytics: {
          views: 142,
          qrScans: 89,
          vcardDownloads: 34,
        },
      },
      {
        title: 'Senior Developer Identity',
        cardType: 'developer',
        orientation: 'horizontal',
        status: 'active',
        isVerified: true,
        issuedBy: 'JobHive Official Identity Authority',
        personal: {
          fullName: 'Vikram Mehta',
          preferredName: 'Vikram',
          jobTitle: 'Staff Backend & Cloud Engineer',
          organization: 'JobHive Technologies',
          department: 'Platform Core',
          idNumber: 'JHV-4182-D',
          validUntil: '08/2029',
          bloodGroup: 'B+',
          emergencyContact: '+91 98112 33445',
          bio: 'Distributed systems engineer with deep expertise in high-throughput microservices and scalable APIs.',
          tagline: 'Scaling Resilient High-Concurrency Backends',
          skills: ['Node.js', 'Go', 'Kubernetes', 'MongoDB', 'AWS'],
        },
        media: {
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
          avatarType: 'image',
        },
        contact: {
          email: 'vikram.mehta@jobhive.app',
          phone: '+91 98112 33445',
          website: 'https://jobhive.app',
          location: 'Noida, UP, India',
        },
        socials: {
          github: 'vikram-cloud',
          linkedin: 'vikram-mehta-dev',
        },
        security: {
          barcodeNumber: '839201948210',
          hasSecurityChip: true,
          hasNfcSymbol: true,
          hasHologramStamp: true,
          badgeLabel: 'CORE ENGINEER',
        },
        theme: {
          themeId: 'obsidian-luxe',
          isCustom: false,
        },
        qrSettings: {
          targetType: 'verify',
          fgColor: '#d4af37',
        },
        analytics: {
          views: 68,
          qrScans: 41,
          vcardDownloads: 19,
        },
      },
    ];

    await Card.insertMany(sampleCards);
    console.log('Sample verified identity cards seeded successfully!');
  } else {
    console.log(`Cards already present in DB: ${count}`);
  }

  process.exit(0);
}

seed().catch(console.error);
