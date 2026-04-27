import React, { useMemo } from 'react'
import useSEO from '../../hooks/useSEO'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpenIcon, ClockIcon, ArrowRightIcon, ArrowLeftIcon, UserIcon, ShareIcon
} from '@heroicons/react/24/outline'

const ARTICLES = [
  {
    id: 1, slug: 'hire-best-service-providers',
    title: 'How to Hire the Best Service Providers on WorkSphere',
    excerpt: 'Learn how to find verified professionals, check reviews, and book confidently using our smart matching system.',
    category: 'Tips', date: 'Apr 20, 2026', readTime: '4 min', author: 'WorkSphere Team',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400', stripColor: 'bg-blue-500',
    content: [
      { type: 'heading', text: 'Finding the Right Professional' },
      { type: 'paragraph', text: 'WorkSphere connects you with verified professionals across 20+ service categories. Whether you need an electrician, plumber, or AC technician, our platform makes it easy to find and book trusted providers.' },
      { type: 'paragraph', text: 'Our smart matching algorithm considers multiple factors: worker ratings (35%), years of experience (25%), proximity to your location (20%), and job completion rate (20%). This ensures you always see the most relevant professionals first.' },
      { type: 'heading', text: 'Check Reviews Before Booking' },
      { type: 'paragraph', text: 'Every service provider on WorkSphere has a transparent review system. After each completed booking, customers can rate their experience with star ratings and detailed feedback. Look for providers with consistently high ratings (4.5+) and a strong completion rate.' },
      { type: 'list', items: [
        'Browse the "Find Workers" page to see top-rated professionals',
        'Filter by category, location, and rating to narrow your search',
        'Read customer reviews to understand their work quality',
        'Check their completion rate — 95%+ indicates reliability',
        'View their portfolio and skills before making a decision',
      ]},
      { type: 'heading', text: 'Smart Booking Tips' },
      { type: 'paragraph', text: 'Book during off-peak hours (weekday mornings) for faster availability. Always provide a detailed address and any specific requirements in the notes section. This helps the worker come prepared with the right tools and materials.' },
      { type: 'paragraph', text: 'After booking, you can track your service in real-time through the dashboard. Status updates flow through: Requested → Accepted → On the Way → Completed. Payment is handled securely through our platform with automatic GST invoice generation.' },
    ]
  },
  {
    id: 2, slug: 'complete-guide-freelancing-india-2026',
    title: 'Complete Guide to Freelancing in India 2026',
    excerpt: 'Everything you need to know about starting your freelance career — from setting rates to finding clients.',
    category: 'Career', date: 'Apr 18, 2026', readTime: '7 min', author: 'Priya Sharma',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400', stripColor: 'bg-purple-500',
    content: [
      { type: 'heading', text: 'The Rise of Freelancing in India' },
      { type: 'paragraph', text: 'India\'s freelance economy has grown by 46% in the last two years. With platforms like WorkSphere democratizing access to professional services, more skilled workers are choosing the flexibility of freelance work over traditional employment.' },
      { type: 'paragraph', text: 'The gig economy in India is projected to reach $455 billion by 2027, creating opportunities for millions of professionals across trades, technology, and creative services.' },
      { type: 'heading', text: 'Setting Your Rates' },
      { type: 'paragraph', text: 'Pricing is crucial for freelance success. Research market rates in your area and skill category. On WorkSphere, you can see what other professionals in your category charge, helping you set competitive yet profitable rates.' },
      { type: 'list', items: [
        'Research competitor pricing in your service category',
        'Factor in materials, travel, and time when setting prices',
        'Start competitively, then increase rates as you build reviews',
        'Offer package deals for recurring services to retain customers',
        'Always include GST in your pricing calculations',
      ]},
      { type: 'heading', text: 'Building Your Reputation' },
      { type: 'paragraph', text: 'Your profile is your storefront. Complete it with a professional photo, detailed skills list, and a compelling bio. Ask satisfied customers to leave reviews — social proof is the most powerful tool for winning new clients.' },
      { type: 'paragraph', text: 'Consistency is key. Respond to booking requests quickly, arrive on time, and always deliver quality work. Over time, high ratings and a strong completion rate will bring a steady stream of bookings automatically.' },
    ]
  },
  {
    id: 3, slug: 'boost-worker-profile-visibility',
    title: '5 Ways to Boost Your Worker Profile Visibility',
    excerpt: 'Stand out from the competition with these proven strategies to get more bookings and better ratings.',
    category: 'Growth', date: 'Apr 15, 2026', readTime: '5 min', author: 'Amit Patel',
    color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', stripColor: 'bg-green-500',
    content: [
      { type: 'heading', text: '1. Complete Your Profile 100%' },
      { type: 'paragraph', text: 'Profiles with all fields completed get 3x more views than incomplete ones. Add a professional photo, write a compelling bio, list all your skills, and set your pricing. Customers trust complete profiles more than empty ones.' },
      { type: 'heading', text: '2. Respond Quickly to Requests' },
      { type: 'paragraph', text: 'Speed matters in the service industry. Workers who accept bookings within 30 minutes receive 40% more repeat customers. Enable notifications to never miss a booking request.' },
      { type: 'heading', text: '3. Collect Reviews Consistently' },
      { type: 'paragraph', text: 'After every job, politely ask customers to rate their experience. Profiles with 10+ reviews rank significantly higher in search results. Quality of reviews matters too — detailed positive feedback builds trust.' },
      { type: 'heading', text: '4. Offer Competitive Pricing' },
      { type: 'paragraph', text: 'You don\'t need to be the cheapest, but you need to offer value. Customers compare prices across workers. If your rate is higher, make sure your reviews and experience justify it.' },
      { type: 'heading', text: '5. Stay Active on the Platform' },
      { type: 'paragraph', text: 'Regular activity signals reliability. Workers who complete at least 5 bookings per month maintain "Active" status, which gives them a visibility boost in search results and recommendations.' },
    ]
  },
  {
    id: 4, slug: 'understanding-payments-invoices',
    title: 'Understanding Payments, Invoices & GST on WorkSphere',
    excerpt: 'A clear breakdown of how payments work, automatic invoice generation, and GST compliance for workers.',
    category: 'Finance', date: 'Apr 12, 2026', readTime: '6 min', author: 'Rahul Verma',
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400', stripColor: 'bg-orange-500',
    content: [
      { type: 'heading', text: 'How Payments Work' },
      { type: 'paragraph', text: 'WorkSphere offers multiple payment methods — Credit/Debit cards, UPI (GPay, PhonePe, Paytm), and WorkSphere Wallet. All transactions are processed securely with 256-bit SSL encryption and are PCI DSS compliant.' },
      { type: 'paragraph', text: 'When a customer books a service, they can pay immediately or after the service is completed. Payment status is tracked in real-time and both parties can see the current status in their dashboard.' },
      { type: 'heading', text: 'Automatic Invoice Generation' },
      { type: 'paragraph', text: 'After every successful payment, WorkSphere automatically generates a professional tax invoice. Invoices include complete details: service description, GST breakdown (18%), customer and worker information, and a unique invoice number for record-keeping.' },
      { type: 'list', items: [
        'Invoices are generated instantly after payment confirmation',
        'GST at 18% is calculated and displayed transparently',
        'Download invoices as PDF from your dashboard anytime',
        'Invoice numbers follow a consistent format for easy tracking',
        'Both customer and worker receive a copy in their invoice section',
      ]},
      { type: 'heading', text: 'GST Compliance' },
      { type: 'paragraph', text: 'All WorkSphere invoices are GST-compliant with proper GSTIN fields and tax breakdowns. Service providers earning above the threshold limit should register for GST. WorkSphere makes compliance easy by auto-calculating taxes on every transaction.' },
    ]
  },
  {
    id: 5, slug: 'remote-work-trends',
    title: 'Remote Work Trends Shaping India\'s Gig Economy',
    excerpt: 'How remote work adoption is transforming job seekers and employers across the country.',
    category: 'Industry', date: 'Apr 10, 2026', readTime: '5 min', author: 'Neha Gupta',
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400', stripColor: 'bg-teal-500',
    content: [
      { type: 'heading', text: 'The Remote Revolution' },
      { type: 'paragraph', text: 'India has seen a 200% increase in remote job listings since 2024. The traditional office model is giving way to hybrid and fully remote arrangements. This shift has opened doors for skilled professionals in tier-2 and tier-3 cities to access opportunities previously limited to metros.' },
      { type: 'heading', text: 'Impact on the Gig Economy' },
      { type: 'paragraph', text: 'Remote work culture has fueled the gig economy. Companies increasingly prefer hiring contractors and freelancers for project-based work. WorkSphere\'s Gigs marketplace caters to this trend, connecting businesses with skilled freelancers for specific deliverables.' },
      { type: 'paragraph', text: 'The flexibility of gig work appeals to a new generation of professionals who prioritize work-life balance. On WorkSphere, gig workers can set their own availability, choose projects that match their skills, and build a diverse portfolio.' },
      { type: 'heading', text: 'What This Means for You' },
      { type: 'paragraph', text: 'Whether you\'re a job seeker, a freelancer, or an employer, adapting to this trend is essential. Build a strong online presence, develop in-demand digital skills, and leverage platforms like WorkSphere to find opportunities or talent in the new economy.' },
    ]
  },
  {
    id: 6, slug: 'top-in-demand-skills',
    title: 'Top 10 In-Demand Skills for Service Professionals',
    excerpt: 'Stay competitive by learning the most sought-after skills that customers are searching for right now.',
    category: 'Skills', date: 'Apr 8, 2026', readTime: '4 min', author: 'Vikram Singh',
    color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400', stripColor: 'bg-red-500',
    content: [
      { type: 'heading', text: 'Most Searched Skills on WorkSphere' },
      { type: 'paragraph', text: 'Based on search data from the last quarter, these are the skills that customers are actively looking for. Developing expertise in any of these areas can significantly increase your booking rate.' },
      { type: 'list', items: [
        'AC Installation & Repair — 340% increase in demand during summer months',
        'Smart Home Setup (IoT devices, automation) — fastest growing category',
        'Full Home Deep Cleaning — consistent demand year-round',
        'Electrical Panel Upgrade & Safety Audit — post-monsoon peak',
        'Plumbing: Water Purifier Installation — growing health awareness',
        'Carpentry: Modular Kitchen Work — premium segment growth',
        'Painting: Textured & Decorative Finishes — urbanization trend',
        'Pest Control (Eco-friendly methods) — sustainability demand',
        'CCTV & Security System Installation — security conscious consumers',
        'Appliance Repair (Washing Machine, Refrigerator) — cost-saving preference',
      ]},
      { type: 'heading', text: 'How to Upskill' },
      { type: 'paragraph', text: 'Many of these skills can be learned through online courses, apprenticeships, or manufacturer training programs. Adding certifications to your WorkSphere profile builds instant credibility and helps you command premium pricing.' },
      { type: 'paragraph', text: 'Focus on one or two specializations rather than being a generalist. Customers are willing to pay more for specialists with proven expertise and strong reviews in a specific service category.' },
    ]
  },
]

const CATEGORIES = ['All', 'Tips', 'Career', 'Growth', 'Finance', 'Industry', 'Skills']

export default function BlogPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = React.useState('All')

  const filtered = useMemo(() =>
    category === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === category),
    [category]
  )

  useSEO({
    title: slug ? `${ARTICLES.find(a => a.slug === slug)?.title || 'Blog'} | WorkSphere` : 'Blog - Insights & Resources | WorkSphere',
    description: slug ? ARTICLES.find(a => a.slug === slug)?.excerpt : 'Expert tips, industry trends, and actionable guides to help you grow on WorkSphere.',
    keywords: 'blog, worksphere, freelance tips, hiring guide',
    type: slug ? 'article' : 'website'
  })

  // ─── Article Detail View ─────────────────────────────────────
  if (slug) {
    const article = ARTICLES.find(a => a.slug === slug)
    if (!article) return <div className="text-center py-20 text-gray-500">Article not found</div>
    
    const relatedArticles = ARTICLES
      .filter(a => a.slug !== slug && (a.category === article.category || Math.random() > 0.5))
      .slice(0, 3)

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-primary-600 via-violet-600 to-purple-600 text-white relative py-14">
          <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <button onClick={() => navigate('/blog')} className="text-white/80 hover:text-white flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors group">
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Blog
            </button>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                {article.category}
              </span>
              <span className="text-white/80 text-sm flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {article.readTime}</span>
              <span className="text-white/80 text-sm">• {article.date}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-sm font-medium">{article.author}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-8 md:p-12">
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-8 border-l-4 border-primary-500 pl-5">
              {article.excerpt}
            </p>
            
            {article.content.map((block, i) => {
              if (block.type === 'heading') {
                return <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">{block.text}</h2>
              }
              if (block.type === 'paragraph') {
                return <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{block.text}</p>
              }
              if (block.type === 'list') {
                return (
                  <ul key={i} className="space-y-2 mb-6 ml-1">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              return null
            })}

            {/* Share / Actions */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${article.color}`}>{article.category}</span>
                <span className="text-xs text-gray-400">{article.readTime} read</span>
              </div>
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: article.title, url: window.location.href }); }}
                className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
              >
                <ShareIcon className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map(ra => (
                  <Link key={ra.id} to={`/blog/${ra.slug}`}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-card-hover transition-all group block">
                    <div className={`h-1 w-12 ${ra.stripColor} rounded-full mb-3`} />
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ra.color}`}>{ra.category}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white mt-2 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">{ra.title}</h4>
                    <p className="text-xs text-gray-400">{ra.readTime} • {ra.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Blog Listing View ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 via-violet-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-sm font-medium px-3 py-1 rounded-full mb-3">
            <BookOpenIcon className="w-4 h-4" /> Blog & Articles
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Insights & Resources</h1>
          <p className="text-white/80 text-lg max-w-2xl">Expert tips, industry trends, and actionable guides to help you grow on WorkSphere.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-50 dark:bg-gray-950" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                category === c
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}>{c}</button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`h-1.5 ${article.stripColor}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${article.color}`}>
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" /> {article.readTime}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-400">{article.author}</span>
                  </div>
                  <Link to={`/blog/${article.slug}`} className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read More <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
