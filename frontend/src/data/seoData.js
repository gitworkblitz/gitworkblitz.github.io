/**
 * ─────────────────────────────────────────────────────────────────────────────
 * WorkSphere — Centralized SEO Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all SEO metadata across the platform.
 * Every page pulls its title, description, keywords, OG tags, and
 * structured data from this file.
 *
 * Usage:
 *   import { getPageSEO } from '../data/seoData'
 *   const seo = getPageSEO('home')
 *   <SEO {...seo} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SITE_URL = 'https://wsphere.me'
export const SITE_NAME = 'WorkSphere'
export const SITE_LOCALE = 'en_IN'
export const SITE_TWITTER = '@worksphere_in'
export const SITE_THEME_COLOR = '#2563eb'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const DEFAULT_DESCRIPTION =
  "WorkSphere is India's leading workforce platform. Book home services, find jobs, post freelance gigs, and hire verified professionals across 20+ categories in Delhi NCR."

export const DEFAULT_KEYWORDS =
  'workforce platform India, home services platform, jobs platform, gig marketplace, hire workers online, freelance gigs India, WorkSphere, plumber Delhi, electrician Delhi, AC repair Delhi NCR'

// ─── Per-page SEO data ──────────────────────────────────────────────────────

const PAGE_SEO = {
  home: {
    title: 'WorkSphere — India\'s #1 Services, Jobs & Gigs Platform',
    description: 'Book verified home service professionals, find your dream job, or hire freelancers across 20+ categories in Delhi NCR. Trusted by thousands.',
    keywords: 'home services India, book plumber online, find electrician Delhi, hire workers, job portal Delhi, freelance gigs India, WorkSphere',
    url: `${SITE_URL}/`,
    type: 'website',
  },

  services: {
    title: 'Home Services — Book Verified Professionals | WorkSphere',
    description: 'Browse 25+ home services from verified professionals — Electrician, Plumber, Carpenter, AC Repair, Salon at Home, Pest Control & more. Instant booking in Delhi NCR.',
    keywords: 'book home services online, electrician near me, plumber Delhi, carpenter services, AC repair Delhi, salon at home, pest control, home cleaning Delhi NCR',
    url: `${SITE_URL}/services`,
    type: 'website',
  },

  jobs: {
    title: 'Find Jobs in Delhi NCR — Full-Time, Part-Time & Remote | WorkSphere',
    description: 'Explore 30+ job listings across tech, marketing, finance, and more. Apply instantly to full-time, part-time, contract, and remote positions in Delhi NCR.',
    keywords: 'jobs in Delhi, jobs near me, full-time jobs, part-time jobs, remote jobs India, tech jobs Delhi NCR, WorkSphere jobs, freshers jobs Delhi',
    url: `${SITE_URL}/jobs`,
    type: 'website',
  },

  gigs: {
    title: 'Freelance Gigs — Find or Post Projects | WorkSphere',
    description: 'Browse 30+ freelance gigs or post your own project. Web development, graphic design, digital marketing, content writing & more. Fixed-price with clear deliverables.',
    keywords: 'freelance gigs India, freelance projects, hire freelancer, web development gig, graphic design project, content writing gig, WorkSphere gigs',
    url: `${SITE_URL}/gigs`,
    type: 'website',
  },

  findWorkers: {
    title: 'Find Verified Workers & Service Providers | WorkSphere',
    description: 'Browse 55+ verified workers across 20 categories. Compare ratings, experience, and pricing. Smart matching ranks the best professionals for your needs.',
    keywords: 'find workers near me, hire service provider, verified professionals Delhi, top-rated plumber, best electrician Delhi NCR, WorkSphere workers',
    url: `${SITE_URL}/find-workers`,
    type: 'website',
  },

  about: {
    title: 'About WorkSphere — Our Mission & Team',
    description: 'WorkSphere is building India\'s most trusted workforce platform. Learn about our mission to connect skilled professionals with customers across Delhi NCR.',
    keywords: 'about WorkSphere, WorkSphere team, WorkSphere mission, workforce platform India, startup Delhi',
    url: `${SITE_URL}/about`,
    type: 'website',
  },

  contact: {
    title: 'Contact Us — Get in Touch | WorkSphere',
    description: 'Have questions or feedback? Reach out to the WorkSphere team. We\'re available via email, phone, and our Delhi NCR office.',
    keywords: 'contact WorkSphere, WorkSphere support, customer service, help WorkSphere, WorkSphere email, WorkSphere phone',
    url: `${SITE_URL}/contact`,
    type: 'website',
  },

  blog: {
    title: 'Blog — Tips, Guides & Industry Insights | WorkSphere',
    description: 'Expert articles on hiring the best service providers, freelancing tips, remote work trends, and career growth strategies. Stay informed with WorkSphere Blog.',
    keywords: 'WorkSphere blog, hiring tips, freelancing guide, remote work India, service provider tips, gig economy India',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },

  faq: {
    title: 'Frequently Asked Questions | WorkSphere',
    description: 'Find answers to common questions about WorkSphere — booking services, payments, refunds, account management, and more.',
    keywords: 'WorkSphere FAQ, how to book service, WorkSphere payment, WorkSphere refund, WorkSphere help, how WorkSphere works',
    url: `${SITE_URL}/faq`,
    type: 'website',
  },

  help: {
    title: 'Help Center — Support & Knowledge Base | WorkSphere',
    description: 'Browse our help center for guides on bookings, payments, services, account settings, and trust & safety. Find solutions fast.',
    keywords: 'WorkSphere help, support center, knowledge base, booking help, payment help, WorkSphere guide',
    url: `${SITE_URL}/help`,
    type: 'website',
  },

  login: {
    title: 'Sign In to Your Account | WorkSphere',
    description: 'Log in to your WorkSphere account to manage bookings, track payments, and access your dashboard.',
    keywords: 'WorkSphere login, sign in, WorkSphere account',
    url: `${SITE_URL}/login`,
    type: 'website',
    noIndex: true,
  },

  signup: {
    title: 'Create Your Free Account | WorkSphere',
    description: 'Join WorkSphere today — book services, find jobs, or start freelancing. Create your free account in seconds.',
    keywords: 'WorkSphere signup, create account, register WorkSphere, join WorkSphere',
    url: `${SITE_URL}/signup`,
    type: 'website',
    noIndex: true,
  },

  privacy: {
    title: 'Privacy Policy | WorkSphere',
    description: 'Learn how WorkSphere collects, uses, and protects your personal data. Read our comprehensive privacy policy.',
    keywords: 'WorkSphere privacy policy, data protection, personal information, GDPR India',
    url: `${SITE_URL}/privacy`,
    type: 'website',
  },

  terms: {
    title: 'Terms of Service | WorkSphere',
    description: 'Read the WorkSphere Terms of Service — account usage, payments, refunds, user conduct, and dispute resolution.',
    keywords: 'WorkSphere terms, terms of service, user agreement, WorkSphere rules',
    url: `${SITE_URL}/terms`,
    type: 'website',
  },

  feedback: {
    title: 'Share Your Feedback | WorkSphere',
    description: 'Help us improve! Share your feedback and suggestions about WorkSphere. Your voice matters.',
    keywords: 'WorkSphere feedback, suggestions, improve WorkSphere, user feedback',
    url: `${SITE_URL}/feedback`,
    type: 'website',
    noIndex: true,
  },

  reportIssue: {
    title: 'Report an Issue | WorkSphere',
    description: 'Encountered a problem? Report bugs, service issues, or safety concerns to the WorkSphere support team.',
    keywords: 'report issue, WorkSphere bug, report problem, WorkSphere support',
    url: `${SITE_URL}/report-issue`,
    type: 'website',
    noIndex: true,
  },

  dashboard: {
    title: 'Dashboard | WorkSphere',
    description: 'Manage your bookings, services, jobs, and gigs from your WorkSphere dashboard.',
    keywords: 'WorkSphere dashboard, manage bookings, my services',
    url: `${SITE_URL}/dashboard`,
    type: 'website',
    noIndex: true,
  },

  notFound: {
    title: 'Page Not Found | WorkSphere',
    description: 'The page you\'re looking for doesn\'t exist. Head back to the WorkSphere homepage.',
    keywords: 'WorkSphere 404, page not found',
    url: SITE_URL,
    type: 'website',
    noIndex: true,
  },
}

/**
 * getPageSEO – Retrieve static SEO data for a known page
 * @param {string} pageName – Key from PAGE_SEO (e.g. 'home', 'services', 'jobs')
 * @returns {{ title, description, keywords, url, type, noIndex? }}
 */
export function getPageSEO(pageName) {
  return PAGE_SEO[pageName] || {
    title: `${SITE_NAME} — Services, Jobs & Gigs Platform`,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    url: SITE_URL,
    type: 'website',
  }
}

// ─── Dynamic SEO builders for detail pages ──────────────────────────────────

/**
 * Build SEO for a service detail page
 */
export function buildServiceSEO(service) {
  if (!service) return getPageSEO('services')
  return {
    title: `${service.title} — Book Now | WorkSphere`,
    description: (service.description || '').slice(0, 160) + (service.description?.length > 160 ? '…' : ''),
    keywords: `${service.category}, ${service.title}, book ${service.category} Delhi, ${service.worker_name || 'professional'}, home service`,
    url: `${SITE_URL}/services/${service.id}`,
    type: 'service',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.title,
      description: service.description,
      provider: {
        '@type': 'Person',
        name: service.worker_name || 'WorkSphere Professional',
      },
      areaServed: {
        '@type': 'Place',
        name: service.location || 'Delhi NCR, India',
      },
      offers: {
        '@type': 'Offer',
        price: String(service.price || 0),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: service.rating ? {
        '@type': 'AggregateRating',
        ratingValue: String(service.rating),
        reviewCount: String(service.total_reviews || 1),
        bestRating: '5',
      } : undefined,
      url: `${SITE_URL}/services/${service.id}`,
    },
  }
}

/**
 * Build SEO for a job detail page
 */
export function buildJobSEO(job) {
  if (!job) return getPageSEO('jobs')
  const salaryText = job.salary_min && job.salary_max
    ? ` — ₹${(job.salary_min / 100000).toFixed(0)}L–${(job.salary_max / 100000).toFixed(0)}L/yr`
    : ''
  return {
    title: `${job.title} at ${job.company}${salaryText} | WorkSphere Jobs`,
    description: (job.description || '').slice(0, 160) + (job.description?.length > 160 ? '…' : ''),
    keywords: `${job.title}, ${job.company}, jobs in ${job.location}, ${(job.skills_required || []).join(', ')}`,
    url: `${SITE_URL}/jobs/${job.id}`,
    type: 'jobPosting',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.createdAt,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        sameAs: SITE_URL,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'IN',
        },
      },
      employmentType: (job.employment_type || 'full_time').replace(/_/g, ' ').toUpperCase(),
      baseSalary: job.salary_min ? {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: 'YEAR',
        },
      } : undefined,
      url: `${SITE_URL}/jobs/${job.id}`,
    },
  }
}

/**
 * Build SEO for a gig detail page
 */
export function buildGigSEO(gig) {
  if (!gig) return getPageSEO('gigs')
  return {
    title: `${gig.title} — Freelance Gig | WorkSphere`,
    description: (gig.description || '').slice(0, 160) + (gig.description?.length > 160 ? '…' : ''),
    keywords: `${gig.category}, ${gig.title}, freelance ${gig.category}, ${(gig.skills || []).join(', ')}`,
    url: `${SITE_URL}/gigs/${gig.id}`,
    type: 'website',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: gig.title,
      description: gig.description,
      price: String(gig.budget || gig.price || 0),
      priceCurrency: 'INR',
      availability: gig.status === 'open' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${SITE_URL}/gigs/${gig.id}`,
    },
  }
}

/**
 * Build SEO for a worker profile page
 */
export function buildWorkerSEO(worker) {
  if (!worker) return getPageSEO('findWorkers')
  return {
    title: `${worker.name} — ${(worker.skills || [])[0] || 'Professional'} in ${worker.location || 'Delhi NCR'} | WorkSphere`,
    description: (worker.bio || `${worker.name} is a verified ${(worker.skills || [])[0] || 'professional'} on WorkSphere with ${worker.experience_years || 0} years of experience.`).slice(0, 160),
    keywords: `${worker.name}, ${(worker.skills || []).join(', ')}, hire ${(worker.skills || [])[0]} ${worker.location}`,
    url: `${SITE_URL}/workers/${worker.id}`,
    type: 'profile',
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: worker.name,
      jobTitle: (worker.skills || [])[0] || 'Service Professional',
      description: worker.bio,
      address: {
        '@type': 'PostalAddress',
        addressLocality: worker.location || 'Delhi NCR',
        addressCountry: 'IN',
      },
      aggregateRating: worker.rating ? {
        '@type': 'AggregateRating',
        ratingValue: String(worker.rating),
        reviewCount: String(worker.total_reviews || 1),
        bestRating: '5',
      } : undefined,
      url: `${SITE_URL}/workers/${worker.id}`,
    },
  }
}

/**
 * Build SEO for a blog article page
 */
export function buildBlogSEO(article) {
  if (!article) return getPageSEO('blog')
  return {
    title: `${article.title} | WorkSphere Blog`,
    description: (article.excerpt || article.description || '').slice(0, 160),
    keywords: `${article.title}, ${(article.tags || []).join(', ')}, WorkSphere blog`,
    url: `${SITE_URL}/blog/${article.slug}`,
    type: 'article',
    ogImage: article.image || DEFAULT_OG_IMAGE,
    schemaData: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt || article.description,
      image: article.image || DEFAULT_OG_IMAGE,
      author: {
        '@type': 'Organization',
        name: article.author || SITE_NAME,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon.svg`,
        },
      },
      datePublished: article.date || article.createdAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${article.slug}`,
      },
      url: `${SITE_URL}/blog/${article.slug}`,
    },
  }
}

// ─── Organization Schema (for homepage) ─────────────────────────────────────

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: DEFAULT_DESCRIPTION,
  areaServed: {
    '@type': 'Place',
    name: 'Delhi NCR, India',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-11-4567-8900',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://twitter.com/worksphere_in',
    'https://www.linkedin.com/company/worksphere',
  ],
}

// ─── WebSite schema with SearchAction (for homepage) ────────────────────────

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/services?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

// ─── BreadcrumbList builder ─────────────────────────────────────────────────

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  }
}
