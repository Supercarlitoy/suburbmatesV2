interface CategoryContent {
  introText: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export function generateCategoryContent(category: any): CategoryContent {
  const categoryName = category.name.toLowerCase();
  
  // Category-specific intro text templates (200+ words each)
  const introTemplates: Record<string, string> = {
    plumbing: `Looking for a plumber in Melbourne? SuburbMates connects locals with verified businesses across more than 600 suburbs. Every listing is backed by ABN checks and authentic community reviews, ensuring you only deal with trusted professionals. Whether you need emergency plumbing in Richmond, bathroom renovations in Hawthorn, or a reliable maintenance plumber in Fitzroy – you'll find them here. Melbourne's unique infrastructure, from heritage homes in Toorak to modern apartments in Southbank, requires specialized knowledge. Our verified plumbers understand Melbourne's building codes, seasonal challenges like tree root intrusions during winter months, and heritage property requirements. Connect directly with local professionals who maintain current Victorian Building Authority registrations and comprehensive insurance coverage.`,
    
    electrician: `Finding a qualified electrician in Melbourne has never been easier. SuburbMates showcases verified electrical contractors across Melbourne's 600+ suburbs, from emergency repairs in Carlton to complete rewiring projects in Camberwell. Every electrician on our platform maintains current electrical licenses and insurance coverage, verified through our rigorous ABN checking process. Melbourne's electrical needs are diverse – from heritage home rewiring that preserves period features to modern smart home installations in new developments. Our electrical professionals understand local requirements, including safety switches, compliance certificates, and council regulations. Whether you're in an inner-city apartment in Southbank or a family home in the outer suburbs, connect with local electricians who deliver quality work and reliable service.`,
    
    'cafe-restaurant': `Melbourne's cafe and restaurant scene is legendary, and SuburbMates helps you discover the best local dining experiences across every suburb. From bustling coffee culture in Fitzroy to fine dining establishments in South Yarra, our platform showcases verified food businesses with authentic community reviews. Every cafe and restaurant listing includes ABN verification and direct contact details – no booking fees or commissions. Melbourne's diverse culinary landscape reflects the city's multicultural character, with everything from laneway coffee bars to award-winning restaurants. Whether you're craving a perfect flat white in Carlton, authentic Vietnamese pho in Richmond, or innovative modern Australian cuisine in the CBD, find trusted local establishments that locals recommend.`,
    
    'hair-beauty': `Melbourne's hair and beauty industry sets trends across Australia, from cutting-edge salons in Chapel Street to boutique beauty clinics in Hawthorn. SuburbMates connects you with verified beauty professionals across all Melbourne suburbs, ensuring every business maintains current qualifications and insurance coverage. Our platform showcases diverse beauty services – from traditional barbershops in Richmond to luxury day spas in Toorak. Whether you need a quick trim in Fitzroy, a complete color transformation in South Yarra, or specialized beauty treatments in the CBD, find verified professionals with authentic client reviews. Every beauty business on SuburbMates undergoes ABN verification and provides direct booking – supporting local professionals without middleman fees.`,
    
    'real-estate': `Melbourne's real estate market is dynamic and diverse, spanning heritage terraces in Fitzroy to modern apartments in Docklands. SuburbMates connects property seekers with verified real estate professionals across all Melbourne suburbs. Every agent and agency maintains current licensing and professional memberships, verified through our comprehensive checking process. Whether you're buying your first home in the outer suburbs, selling a period property in established areas like Hawthorn, or seeking investment opportunities in growth corridors, our platform showcases professionals who understand local market conditions. From boutique agencies specializing in heritage properties to large firms handling new developments, find real estate experts who deliver results and maintain strong community connections.`
  };

  // Default template for categories not specifically defined
  const defaultIntro = `Looking for ${categoryName} in Melbourne? SuburbMates connects locals with verified businesses across more than 600 suburbs. Every listing is backed by ABN checks and authentic community reviews, ensuring you only deal with trusted professionals. Whether you need services in inner Melbourne suburbs like Richmond and Fitzroy, or outer areas across the greater Melbourne region, you'll find verified ${categoryName} businesses here. Our platform supports Melbourne's diverse business community by providing direct connections between locals and professionals. Every business undergoes identity verification and maintains current credentials, insurance, and professional standards. Connect with local ${categoryName} professionals who understand Melbourne's unique requirements and deliver quality services across all suburbs.`;

  return {
    introText: introTemplates[category.id] || defaultIntro
  };
}

export function generateCategoryFAQs(category: any): FAQ[] {
  const categoryName = category.name.toLowerCase();
  
  // Category-specific FAQs
  const faqTemplates: Record<string, FAQ[]> = {
    plumbing: [
      {
        question: `How do I find a plumber near me in Melbourne?`,
        answer: `Use our suburb-based search to find verified plumbers in your specific Melbourne area. Each listing shows the plumber's service areas, contact details, and customer reviews from local residents.`
      },
      {
        question: `Are SuburbMates plumbers verified?`,
        answer: `Yes, every plumber on SuburbMates undergoes ABN verification, license checking, and insurance confirmation. We verify Victorian Building Authority registrations and professional credentials.`
      },
      {
        question: `Can I contact plumbers directly?`,
        answer: `Absolutely. SuburbMates provides direct contact details for all plumbers. There are no booking fees or commissions – you connect directly with local professionals.`
      },
      {
        question: `How much does it cost to list my plumbing business?`,
        answer: `Basic business listings on SuburbMates are free. We also offer premium features for enhanced visibility and professional profile customization.`
      },
      {
        question: `How are plumbing businesses reviewed?`,
        answer: `Reviews come from verified local customers who have used the services. We maintain review authenticity through our community verification process.`
      }
    ],
    
    // Default FAQs for other categories
    default: [
      {
        question: `How do I find ${categoryName} near me in Melbourne?`,
        answer: `Use our suburb-based search to find verified ${categoryName} businesses in your specific Melbourne area. Each listing shows service areas, contact details, and customer reviews.`
      },
      {
        question: `Are SuburbMates ${categoryName} businesses verified?`,
        answer: `Yes, every ${categoryName} business on SuburbMates undergoes ABN verification and credential checking. We verify licenses, insurance, and professional standards.`
      },
      {
        question: `Can I contact ${categoryName} businesses directly?`,
        answer: `Absolutely. SuburbMates provides direct contact details for all businesses. There are no booking fees or commissions – you connect directly with local professionals.`
      },
      {
        question: `How much does it cost to list my ${categoryName} business?`,
        answer: `Basic business listings on SuburbMates are free. We also offer premium features for enhanced visibility and professional profile customization.`
      },
      {
        question: `How are ${categoryName} businesses reviewed?`,
        answer: `Reviews come from verified local customers who have used the services. We maintain review authenticity through our community verification process.`
      }
    ]
  };

  return faqTemplates[category.id] || faqTemplates.default;
}

// Suburb content generation
interface SuburbContent {
  introText: string;
  topCategories: Array<{
    name: string;
    slug: string;
    description: string;
  }>;
}

export function generateSuburbContent(suburbName: string): SuburbContent {
  // Suburb-specific intro text templates
  const suburbIntros: Record<string, string> = {
    richmond: `Richmond is one of Melbourne's most vibrant suburbs, home to a wide range of trusted local businesses. On SuburbMates, you can discover cafes on Swan Street, licensed plumbers, electricians, beauty salons, and more – all verified through ABN checks. By supporting Richmond businesses, you're keeping Melbourne's local economy strong. Richmond combines Melbourne's industrial heritage with modern urban living, creating a dynamic business ecosystem. From the bustling retail strips to the growing corporate precinct near Richmond Station, this inner-city suburb supports diverse enterprises serving both local residents and the broader Melbourne metropolitan area. With excellent transport connections and a thriving community, Richmond businesses benefit from high foot traffic and strong local support.`,
    
    fitzroy: `Fitzroy's creative spirit extends to its diverse business community, from cutting-edge design studios to traditional family-run establishments. SuburbMates showcases verified Fitzroy businesses across all categories, ensuring you connect with trusted professionals in this iconic Melbourne suburb. Whether you're seeking innovative services on Brunswick Street or reliable trades in the residential areas, every business maintains verified credentials and local community connections. Fitzroy's reputation as Melbourne's cultural hub attracts both established businesses and emerging entrepreneurs. The suburb's mix of converted warehouses, heritage terraces, and modern developments creates unique opportunities for diverse business types, from creative agencies to traditional services.`,
    
    hawthorn: `Hawthorn represents established Melbourne living, with a business community that reflects the suburb's premium residential character. SuburbMates connects you with verified Hawthorn businesses, from professional services to specialized trades that understand the unique requirements of this prestigious suburb. Whether you need heritage property specialists, family-friendly services, or luxury providers, Hawthorn businesses maintain high standards and strong community reputations. The suburb's leafy streets and established homes create specific business needs, from mature garden maintenance to heritage building specialists, all available through our verified business directory.`
  };

  const defaultSuburbIntro = `${suburbName} is home to a diverse range of trusted local businesses. On SuburbMates, you can discover verified professionals across all categories – from licensed trades to professional services – all backed by ABN checks and authentic community reviews. By supporting ${suburbName} businesses, you're strengthening Melbourne's local economy and community connections. Our platform showcases the best of ${suburbName}'s business community, connecting residents with trusted local professionals who understand the suburb's unique character and requirements.`;

  const topCategories = [
    { name: 'Plumbing', slug: 'plumbing', description: 'Licensed plumbers for emergencies and renovations' },
    { name: 'Electrician', slug: 'electrician', description: 'Qualified electrical contractors and emergency services' },
    { name: 'Cafes & Restaurants', slug: 'cafe-restaurant', description: 'Local dining and coffee experiences' },
    { name: 'Hair & Beauty', slug: 'hair-beauty', description: 'Salons, barbers, and beauty treatments' },
    { name: 'Real Estate', slug: 'real-estate', description: 'Property sales, rentals, and management' },
    { name: 'Automotive', slug: 'automotive', description: 'Car repairs, servicing, and automotive services' }
  ];

  return {
    introText: suburbIntros[suburbName?.toLowerCase()] || defaultSuburbIntro,
    topCategories
  };
}

export function generateSuburbFAQs(suburbName: string): FAQ[] {
  return [
    {
      question: `What businesses are most popular in ${suburbName}?`,
      answer: `${suburbName} has a diverse business community. Popular categories include cafes and restaurants, professional services, hair and beauty salons, and licensed trades like plumbers and electricians.`
    },
    {
      question: `Are ${suburbName} businesses verified on SuburbMates?`,
      answer: `Yes, every business in ${suburbName} on SuburbMates undergoes ABN verification and credential checking. We verify licenses, insurance, and professional standards for all listings.`
    },
    {
      question: `How do I list my ${suburbName} business?`,
      answer: `You can claim your business profile for free on SuburbMates. Simply search for your business and click "Claim This Business" or contact us to get started.`
    },
    {
      question: `Can I find trades and services as well as cafes?`,
      answer: `Absolutely. SuburbMates features all business types in ${suburbName}, from licensed trades like plumbers and electricians to hospitality, retail, professional services, and more.`
    },
    {
      question: `How do reviews work on SuburbMates?`,
      answer: `Reviews come from verified local customers who have used the services. We maintain review authenticity and encourage honest feedback from the ${suburbName} community.`
    }
  ];
}