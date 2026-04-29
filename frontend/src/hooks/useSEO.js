import { useEffect } from 'react'

const SITE_URL = 'https://wsphere.me'
const SITE_NAME = 'WorkSphere'
const DEFAULT_DESCRIPTION = 'WorkSphere is India\'s leading workforce platform. Book home services, find jobs, post freelance gigs, and hire verified professionals across 20+ categories.'
const DEFAULT_KEYWORDS = 'workforce platform India, home services platform, jobs platform, gig marketplace, hire workers online, freelance gigs India, WorkSphere'

/**
 * useSEO - Production-grade SEO hook for WorkSphere
 * Supports: title, meta tags, Open Graph, Twitter Cards, canonical URL,
 *           and rich JSON-LD schema for website, article, service, job, and FAQ types.
 */
export default function useSEO({ title, description, keywords, ogImage, url, type = 'website', schemaData, faqData }) {
  useEffect(() => {
    // 1. Update Title — ensure proper format with pipe separator
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

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', desc)
    setMetaTag('name', 'keywords', kw)
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

    // 4. Update Open Graph Tags
    setMetaTag('property', 'og:title', finalTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:type', type === 'jobPosting' ? 'website' : type)
    setMetaTag('property', 'og:url', url || window.location.href)
    setMetaTag('property', 'og:site_name', SITE_NAME)
    setMetaTag('property', 'og:locale', 'en_IN')
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage)
    }

    // 5. Update Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image')
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

    // 7. Schema Markup (JSON-LD) — supports custom schema or auto-generates
    let schemaScript = document.getElementById('seo-schema')
    if (!schemaScript) {
      schemaScript = document.createElement('script')
      schemaScript.setAttribute('type', 'application/ld+json')
      schemaScript.setAttribute('id', 'seo-schema')
      document.head.appendChild(schemaScript)
    }
    
    let schema
    if (schemaData) {
      // Use provided custom schema (e.g., Service, JobPosting)
      schema = schemaData
    } else if (type === 'article') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": finalTitle,
        "description": desc,
        "image": ogImage || `${SITE_URL}/og-image.jpg`,
        "author": { "@type": "Organization", "name": SITE_NAME },
        "publisher": { "@type": "Organization", "name": SITE_NAME, "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` } },
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

    // 8. FAQ Schema (separate script to not conflict with main schema)
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

    // Cleanup — remove FAQ schema on unmount
    return () => {
      const faq = document.getElementById('seo-faq-schema')
      if (faq) faq.remove()
    }

  }, [title, description, keywords, ogImage, url, type, schemaData, faqData])
}
