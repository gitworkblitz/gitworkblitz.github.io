import { useEffect } from 'react'

const SITE_URL = 'https://wsphere.me'
const SITE_NAME = 'WorkSphere'
const SITE_LOCALE = 'en_IN'
const SITE_TWITTER = '@worksphere_in'
const DEFAULT_DESCRIPTION = 'WorkSphere is India\'s leading workforce platform. Book home services, find jobs, post freelance gigs, and hire verified professionals across 20+ categories.'
const DEFAULT_KEYWORDS = 'workforce platform India, home services platform, jobs platform, gig marketplace, hire workers online, freelance gigs India, WorkSphere'

/**
 * useSEO - Production-grade SEO hook for WorkSphere
 * Uses react-helmet-async under the hood via DOM manipulation
 * (Helmet component approach is preferred — see components/SEO.jsx)
 *
 * Supports: title, meta tags, Open Graph, Twitter Cards, canonical URL,
 *           and rich JSON-LD schema for website, article, service, job, and FAQ types.
 */
export default function useSEO({ title, description, keywords, ogImage, url, type = 'website', schemaData, faqData, noIndex }) {
  useEffect(() => {
    // 1. Update Title
    const baseTitle = title || `${SITE_NAME} | Services, Jobs & Gigs Platform in India`
    const finalTitle = baseTitle.includes(SITE_NAME) ? baseTitle : `${baseTitle} | ${SITE_NAME}`
    document.title = finalTitle

    // 2. Helper to update or create meta tags
    const setMetaTag = (attr, key, content) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, key)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    const desc = description || DEFAULT_DESCRIPTION
    const kw = keywords || DEFAULT_KEYWORDS
    const robotsContent = noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', desc)
    setMetaTag('name', 'keywords', kw)
    setMetaTag('name', 'robots', robotsContent)

    // 4. Update Open Graph Tags
    const ogType = type === 'jobPosting' || type === 'service' || type === 'profile' ? 'website' : type
    setMetaTag('property', 'og:title', finalTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:type', ogType)
    setMetaTag('property', 'og:url', url || window.location.href)
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('property', 'og:locale', SITE_LOCALE)
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage)
    }

    // 5. Update Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:site', SITE_TWITTER)
    setMetaTag('name', 'twitter:title', finalTitle)
    setMetaTag('name', 'twitter:description', desc)
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage)
    }

    // 6. Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url || window.location.href)

    // 7. Schema Markup (JSON-LD)
    let schemaScript = document.getElementById('seo-schema')
    if (!schemaScript) {
      schemaScript = document.createElement('script')
      schemaScript.setAttribute('type', 'application/ld+json')
      schemaScript.setAttribute('id', 'seo-schema')
      document.head.appendChild(schemaScript)
    }
    
    let schema
    if (schemaData) {
      schema = schemaData
    } else if (type === 'article') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": finalTitle,
        "description": desc,
        "image": ogImage || `${SITE_URL}/og-image.jpg`,
        "author": { "@type": "Organization", "name": SITE_NAME },
        "publisher": { "@type": "Organization", "name": SITE_NAME, "logo": { "@type": "ImageObject", "url": `${SITE_URL}/favicon.svg` } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": url || window.location.href }
      }
    } else if (type === 'service') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": title,
        "description": desc,
        "provider": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
        "areaServed": { "@type": "Country", "name": "India" },
        "url": url || window.location.href,
      }
    } else if (type === 'jobPosting') {
      schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "description": desc,
        "hiringOrganization": { "@type": "Organization", "name": SITE_NAME, "sameAs": SITE_URL },
        "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressCountry": "IN" } },
        "url": url || window.location.href,
      }
    } else {
      schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": `${SITE_URL}/`,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/services?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    }
    schemaScript.textContent = JSON.stringify(schema)

    // 8. FAQ Schema
    let faqScript = document.getElementById('seo-faq-schema')
    if (faqData && faqData.length > 0) {
      if (!faqScript) {
        faqScript = document.createElement('script')
        faqScript.setAttribute('type', 'application/ld+json')
        faqScript.setAttribute('id', 'seo-faq-schema')
        document.head.appendChild(faqScript)
      }
      faqScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      })
    } else if (faqScript) {
      faqScript.remove()
    }

    // 9. Breadcrumb Schema
    let breadcrumbScript = document.getElementById('seo-breadcrumb-schema')
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0)
    
    if (pathParts.length > 0 && !noIndex) {
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script')
        breadcrumbScript.setAttribute('type', 'application/ld+json')
        breadcrumbScript.setAttribute('id', 'seo-breadcrumb-schema')
        document.head.appendChild(breadcrumbScript)
      }
      
      const breadcrumbItems = [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": SITE_URL
      }]
      
      let currentPath = ''
      pathParts.forEach((part, index) => {
        currentPath += `/${part}`
        // Simple humanization of slug
        const name = part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        breadcrumbItems.push({
          "@type": "ListItem",
          "position": index + 2,
          "name": name,
          "item": `${SITE_URL}${currentPath}`
        })
      })

      breadcrumbScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      })
    } else if (breadcrumbScript) {
      breadcrumbScript.remove()
    }

    // Cleanup
    return () => {
      const faq = document.getElementById('seo-faq-schema')
      const breadcrumb = document.getElementById('seo-breadcrumb-schema')
      if (faq) faq.remove()
      if (breadcrumb) breadcrumb.remove()
    }

  }, [title, description, keywords, ogImage, url, type, schemaData, faqData, noIndex])
}
