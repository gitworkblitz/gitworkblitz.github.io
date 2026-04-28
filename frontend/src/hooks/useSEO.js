import { useEffect } from 'react'

/**
 * useSEO - Production-grade SEO hook for WorkSphere
 * Supports: title, meta tags, Open Graph, Twitter Cards, canonical URL,
 *           and rich JSON-LD schema for website, article, service, and job types.
 */
export default function useSEO({ title, description, keywords, ogImage, url, type = 'website', schemaData }) {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = title ? `${title} | WorkSphere` : 'WorkSphere - Hire Experts & Find Jobs'
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

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', description || 'WorkSphere is India\'s top platform for hiring professionals, freelancers, and finding local jobs.')
    setMetaTag('name', 'keywords', keywords || 'freelance, jobs, hiring, local services, plumbers, electricians, developers, worksphere')

    // 4. Update Open Graph Tags
    setMetaTag('property', 'og:title', finalTitle)
    setMetaTag('property', 'og:description', description || 'Find top talent or get hired on WorkSphere.')
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:url', url || window.location.href)
    setMetaTag('property', 'og:site_name', 'WorkSphere')
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage)
    }

    // 5. Update Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', finalTitle)
    setMetaTag('name', 'twitter:description', description || 'Find top talent or get hired on WorkSphere.')
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
        "description": description,
        "image": ogImage || "https://worksphere.me/og-image.jpg",
        "author": { "@type": "Organization", "name": "WorkSphere" },
        "publisher": { "@type": "Organization", "name": "WorkSphere", "logo": { "@type": "ImageObject", "url": "https://worksphere.me/logo.png" } }
      }
    } else if (type === 'service') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": title,
        "description": description,
        "provider": { "@type": "Organization", "name": "WorkSphere", "url": "https://worksphere.me" },
        "areaServed": { "@type": "Country", "name": "India" },
        "url": url || window.location.href,
      }
    } else if (type === 'jobPosting') {
      schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "description": description,
        "hiringOrganization": { "@type": "Organization", "name": "WorkSphere", "sameAs": "https://worksphere.me" },
        "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressCountry": "IN" } },
        "url": url || window.location.href,
      }
    } else {
      schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "WorkSphere",
        "url": "https://worksphere.me/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://worksphere.me/services?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    }
    schemaScript.textContent = JSON.stringify(schema)

  }, [title, description, keywords, ogImage, url, type, schemaData])
}
