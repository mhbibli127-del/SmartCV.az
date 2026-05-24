import { getDatabase } from './mongodb';
import { Template } from './models';

const templates: Omit<Template, '_id'>[] = [
  // Professional Templates
  {
    id: 1,
    title: "Modern Professional",
    category: "Professional",
    style: "clean",
    color: "blue",
    description: "Clean and minimalist design for corporate roles",
    features: ["ATS-friendly", "Professional layout", "Easy customization"],
    imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop",
    views: 1250,
    downloads: 340,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    title: "Executive Classic",
    category: "Professional",
    style: "classic",
    color: "navy",
    description: "Traditional format for senior management positions",
    features: ["Executive focus", "Timeless design", "Leadership emphasis"],
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=500&fit=crop",
    views: 980,
    downloads: 256,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    title: "Tech Professional",
    category: "Professional",
    style: "modern",
    color: "purple",
    description: "Optimized for software engineering and IT roles",
    features: ["Skills-first", "Project showcase", "GitHub integration"],
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=500&fit=crop",
    views: 1450,
    downloads: 420,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    title: "Corporate Minimalist",
    category: "Professional",
    style: "minimal",
    color: "gray",
    description: "Sleek design for modern corporate environments",
    features: ["Clean lines", "Professional", "Easy to read"],
    imageUrl: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=400&h=500&fit=crop",
    views: 890,
    downloads: 234,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    title: "Business Analyst",
    category: "Professional",
    style: "analytical",
    color: "teal",
    description: "Data-driven layout for business analysts",
    features: ["Metrics focus", "Analytical", "Results-oriented"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop",
    views: 756,
    downloads: 198,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Creative Templates
  {
    id: 6,
    title: "Creative Designer",
    category: "Creative",
    style: "bold",
    color: "pink",
    description: "Eye-catching design for creative professionals",
    features: ["Visual portfolio", "Color accents", "Unique layout"],
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=500&fit=crop",
    views: 1680,
    downloads: 512,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 7,
    title: "Artist Portfolio",
    category: "Creative",
    style: "artistic",
    color: "orange",
    description: "Showcase your artistic work with style",
    features: ["Gallery section", "Portfolio links", "Creative typography"],
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=500&fit=crop",
    views: 1120,
    downloads: 345,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 8,
    title: "Marketing Pro",
    category: "Creative",
    style: "dynamic",
    color: "green",
    description: "Dynamic layout for marketing and communications",
    features: ["Campaign showcase", "Metrics display", "Brand-focused"],
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop",
    views: 1340,
    downloads: 389,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 9,
    title: "Graphic Designer",
    category: "Creative",
    style: "visual",
    color: "red",
    description: "Bold design for graphic designers",
    features: ["Visual-heavy", "Colorful", "Portfolio-focused"],
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=500&fit=crop",
    views: 1456,
    downloads: 423,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 10,
    title: "UX/UI Designer",
    category: "Creative",
    style: "modern",
    color: "indigo",
    description: "Clean design for UX/UI professionals",
    features: ["User-centric", "Modern", "Process-focused"],
    imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=400&h=500&fit=crop",
    views: 1234,
    downloads: 367,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Academic Templates
  {
    id: 11,
    title: "Academic Researcher",
    category: "Academic",
    style: "formal",
    color: "gray",
    description: "Comprehensive format for research positions",
    features: ["Publications section", "Research focus", "Citation style"],
    imageUrl: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=500&fit=crop",
    views: 890,
    downloads: 234,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 12,
    title: "Graduate Student",
    category: "Academic",
    style: "clean",
    color: "teal",
    description: "Perfect for recent graduates and PhD candidates",
    features: ["Education emphasis", "Research projects", "Academic achievements"],
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=500&fit=crop",
    views: 1567,
    downloads: 445,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 13,
    title: "Professor CV",
    category: "Academic",
    style: "detailed",
    color: "brown",
    description: "Comprehensive academic CV for faculty positions",
    features: ["Teaching experience", "Grants & awards", "Service activities"],
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=500&fit=crop",
    views: 678,
    downloads: 189,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 14,
    title: "Research Scientist",
    category: "Academic",
    style: "scientific",
    color: "blue",
    description: "Specialized for scientific research positions",
    features: ["Publications", "Grants", "Research focus"],
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=500&fit=crop",
    views: 923,
    downloads: 267,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 15,
    title: "Postdoc Researcher",
    category: "Academic",
    style: "academic",
    color: "purple",
    description: "For postdoctoral research positions",
    features: ["Research emphasis", "Publications", "Future goals"],
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=500&fit=crop",
    views: 567,
    downloads: 156,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Industry-Specific Templates
  {
    id: 16,
    title: "Healthcare Professional",
    category: "Healthcare",
    style: "clean",
    color: "cyan",
    description: "Specialized for medical and healthcare roles",
    features: ["Certifications", "Clinical experience", "Patient care focus"],
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=500&fit=crop",
    views: 1123,
    downloads: 334,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 17,
    title: "Finance Analyst",
    category: "Finance",
    style: "professional",
    color: "emerald",
    description: "Data-driven design for finance professionals",
    features: ["Quantitative skills", "Financial modeling", "Analytics focus"],
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=500&fit=crop",
    views: 1456,
    downloads: 423,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 18,
    title: "Legal Professional",
    category: "Legal",
    style: "formal",
    color: "slate",
    description: "Conservative design for legal practitioners",
    features: ["Bar admissions", "Case experience", "Professional demeanor"],
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=500&fit=crop",
    views: 890,
    downloads: 245,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 19,
    title: "Sales Executive",
    category: "Sales",
    style: "dynamic",
    color: "orange",
    description: "Results-focused layout for sales professionals",
    features: ["Metrics-driven", "Achievement-focused", "Target-oriented"],
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=500&fit=crop",
    views: 1234,
    downloads: 356,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 20,
    title: "HR Manager",
    category: "HR",
    style: "professional",
    color: "pink",
    description: "People-focused design for HR professionals",
    features: ["People skills", "Organizational", "Culture-focused"],
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop",
    views: 987,
    downloads: 278,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Modern/Tech Templates
  {
    id: 21,
    title: "Startup Founder",
    category: "Startup",
    style: "innovative",
    color: "indigo",
    description: "Bold design for entrepreneurs and startup roles",
    features: ["Venture focus", "Pitch-ready", "Innovation showcase"],
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=500&fit=crop",
    views: 1678,
    downloads: 489,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 22,
    title: "Data Scientist",
    category: "Tech",
    style: "analytical",
    color: "violet",
    description: "Showcase your data science expertise",
    features: ["Technical skills", "Project portfolio", "Algorithms focus"],
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop",
    views: 1456,
    downloads: 423,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 23,
    title: "Product Manager",
    category: "Tech",
    style: "strategic",
    color: "rose",
    description: "Highlight your product management achievements",
    features: ["Product roadmap", "Metrics-driven", "Cross-functional"],
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop",
    views: 1345,
    downloads: 398,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 24,
    title: "Software Engineer",
    category: "Tech",
    style: "technical",
    color: "blue",
    description: "Technical layout for software developers",
    features: ["Code-focused", "Project showcase", "Tech stack"],
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=500&fit=crop",
    views: 1890,
    downloads: 534,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 25,
    title: "DevOps Engineer",
    category: "Tech",
    style: "infrastructure",
    color: "green",
    description: "Infrastructure-focused for DevOps professionals",
    features: ["CI/CD", "Cloud", "Automation"],
    imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=500&fit=crop",
    views: 1123,
    downloads: 334,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // International Templates
  {
    id: 26,
    title: "European CV",
    category: "International",
    style: "europass",
    color: "blue",
    description: "Europass format for European job applications",
    features: ["EU standard", "Multilingual", "European market"],
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=500&fit=crop",
    views: 890,
    downloads: 234,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 27,
    title: "Asian Professional",
    category: "International",
    style: "formal",
    color: "red",
    description: "Cultural adaptation for Asian job markets",
    features: ["Cultural fit", "Photo included", "Personal details"],
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=500&fit=crop",
    views: 678,
    downloads: 189,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 28,
    title: "Global Executive",
    category: "International",
    style: "cosmopolitan",
    color: "amber",
    description: "International format for global opportunities",
    features: ["Multi-language", "Global experience", "Cultural adaptability"],
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop",
    views: 923,
    downloads: 267,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 29,
    title: "Middle East Professional",
    category: "International",
    style: "traditional",
    color: "gold",
    description: "Adapted for Middle Eastern job markets",
    features: ["Photo included", "Personal details", "Cultural respect"],
    imageUrl: "https://images.unsplash.com/photo-1542385151-54b2d3f1a9c4?w=400&h=500&fit=crop",
    views: 456,
    downloads: 123,
    rating: 4.4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 30,
    title: "Australian Professional",
    category: "International",
    style: "modern",
    color: "cyan",
    description: "Optimized for Australian job market",
    features: ["Australian standards", "Clean layout", "Professional"],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    views: 567,
    downloads: 156,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Additional Professional Templates
  {
    id: 31,
    title: "Consultant",
    category: "Professional",
    style: "strategic",
    color: "navy",
    description: "Strategic layout for management consultants",
    features: ["Problem-solving", "Client-focused", "Results-driven"],
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop",
    views: 1123,
    downloads: 334,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 32,
    title: "Project Manager",
    category: "Professional",
    style: "organized",
    color: "teal",
    description: "Organized layout for project managers",
    features: ["Timeline-focused", "Deliverables", "Stakeholder management"],
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=500&fit=crop",
    views: 1345,
    downloads: 398,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 33,
    title: "Operations Manager",
    category: "Professional",
    style: "efficient",
    color: "green",
    description: "Efficiency-focused for operations roles",
    features: ["Process optimization", "KPIs", "Lean methodology"],
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=500&fit=crop",
    views: 987,
    downloads: 278,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 34,
    title: "Supply Chain",
    category: "Professional",
    style: "logistical",
    color: "brown",
    description: "For supply chain and logistics professionals",
    features: ["Logistics focus", "Efficiency", "Global reach"],
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=500&fit=crop",
    views: 678,
    downloads: 189,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 35,
    title: "Quality Assurance",
    category: "Professional",
    style: "precise",
    color: "purple",
    description: "Detail-oriented for QA professionals",
    features: ["Quality focus", "Testing", "Compliance"],
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=500&fit=crop",
    views: 789,
    downloads: 223,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Additional Creative Templates
  {
    id: 36,
    title: "Video Editor",
    category: "Creative",
    style: "visual",
    color: "red",
    description: "Dynamic design for video editors",
    features: ["Portfolio showcase", "Software skills", "Project reel"],
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44c?w=400&h=500&fit=crop",
    views: 890,
    downloads: 256,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 37,
    title: "Photographer",
    category: "Creative",
    style: "artistic",
    color: "amber",
    description: "Visual layout for photographers",
    features: ["Portfolio grid", "Equipment", "Style focus"],
    imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=500&fit=crop",
    views: 1123,
    downloads: 334,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 38,
    title: "Content Creator",
    category: "Creative",
    style: "modern",
    color: "pink",
    description: "For digital content creators",
    features: ["Social metrics", "Platform focus", "Engagement data"],
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=500&fit=crop",
    views: 1456,
    downloads: 423,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 39,
    title: "Fashion Designer",
    category: "Creative",
    style: "stylish",
    color: "rose",
    description: "Elegant design for fashion professionals",
    features: ["Collection showcase", "Brand aesthetic", "Trend-focused"],
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=500&fit=crop",
    views: 987,
    downloads: 278,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 40,
    title: "Interior Designer",
    category: "Creative",
    style: "spatial",
    color: "orange",
    description: "Visual layout for interior designers",
    features: ["Project gallery", "Style portfolio", "Client testimonials"],
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=500&fit=crop",
    views: 756,
    downloads: 212,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Additional Tech Templates
  {
    id: 41,
    title: "Full Stack Developer",
    category: "Tech",
    style: "comprehensive",
    color: "blue",
    description: "Complete showcase for full-stack developers",
    features: ["Frontend & backend", "Full projects", "Tech stack"],
    imageUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=500&fit=crop",
    views: 1678,
    downloads: 489,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 42,
    title: "Mobile Developer",
    category: "Tech",
    style: "app-focused",
    color: "green",
    description: "For iOS and Android developers",
    features: ["App portfolio", "Store links", "Platform skills"],
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=500&fit=crop",
    views: 1234,
    downloads: 356,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 43,
    title: "Cloud Architect",
    category: "Tech",
    style: "infrastructure",
    color: "indigo",
    description: "For cloud infrastructure professionals",
    features: ["Cloud platforms", "Architecture diagrams", "Certifications"],
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop",
    views: 987,
    downloads: 278,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 44,
    title: "Cybersecurity",
    category: "Tech",
    style: "secure",
    color: "red",
    description: "For cybersecurity professionals",
    features: ["Security certifications", "Incident response", "Compliance"],
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=500&fit=crop",
    views: 1123,
    downloads: 334,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 45,
    title: "AI/ML Engineer",
    category: "Tech",
    style: "innovative",
    color: "violet",
    description: "For AI and machine learning engineers",
    features: ["ML projects", "Research papers", "Model portfolio"],
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=500&fit=crop",
    views: 1456,
    downloads: 423,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Entry Level Templates
  {
    id: 46,
    title: "Entry Level Professional",
    category: "Entry Level",
    style: "fresh",
    color: "blue",
    description: "Perfect for recent graduates",
    features: ["Education focus", "Internships", "Skills highlight"],
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=500&fit=crop",
    views: 1890,
    downloads: 534,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 47,
    title: "Internship Seeker",
    category: "Entry Level",
    style: "eager",
    color: "green",
    description: "For students seeking internships",
    features: ["Academic projects", "Relevant coursework", "Eagerness to learn"],
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop",
    views: 1345,
    downloads: 398,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 48,
    title: "First Job",
    category: "Entry Level",
    style: "simple",
    color: "teal",
    description: "Simple layout for first-time job seekers",
    features: ["Easy to fill", "Clear sections", "Professional"],
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=500&fit=crop",
    views: 1567,
    downloads: 445,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 49,
    title: "Career Change",
    category: "Career Change",
    style: "transitional",
    color: "purple",
    description: "For professionals changing careers",
    features: ["Transferable skills", "Motivation", "New direction"],
    imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=500&fit=crop",
    views: 890,
    downloads: 234,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 50,
    title: "Return to Work",
    category: "Career Change",
    style: "confident",
    color: "rose",
    description: "For professionals returning to workforce",
    features: ["Gap explanation", "Updated skills", "Confidence focus"],
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
    views: 678,
    downloads: 189,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function runMigration() {
  const db = await getDatabase();
  
  try {
    console.log('Starting database migration...');
    
    // Check if templates already exist
    const existingCount = await db.collection<Template>('templates').countDocuments();
    
    if (existingCount > 0) {
      console.log(`Templates already exist (${existingCount} found). Skipping migration.`);
      return;
    }
    
    // Insert templates
    const result = await db.collection<Template>('templates').insertMany(templates);
    console.log(`Successfully inserted ${result.insertedCount} templates`);
    
    // Create indexes for better query performance
    await db.collection<Template>('templates').createIndex({ category: 1 });
    await db.collection<Template>('templates').createIndex({ title: 'text', description: 'text', features: 'text' });
    await db.collection<Template>('templates').createIndex({ views: -1 });
    await db.collection<Template>('templates').createIndex({ downloads: -1 });
    
    console.log('Database indexes created successfully');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
