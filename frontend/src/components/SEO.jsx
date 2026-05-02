import React from 'react'
import { Helmet } from 'react-helmet-async'
import {
  SITE_NAME,
  SITE_URL,
  SITE_LOCALE,
  SITE_TWITTER,
  SITE_THEME_COLOR,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
} from '../data/seoData'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEO Component — Drop-in Helmet wrapper for any page
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Props:
 *   title        – Page title (auto-appends "| WorkSphere" if missing)
 *   description  – Meta description (max 160 chars recommended)
 *   keywords     – Comma-separated keywords string
 *   url          – Canonical URL for this page
 *   type         – Open Graph type ('website' | 'article' | 'profile')
 *   ogImage      – Open Graph image URL
 *   noIndex      – If true, tells crawlers not to index this page
 *   schemaData   – JSON-LD structured data object (or array of objects)
 *   children     – Optional extra <meta> or <link> tags
 *
 * Usage:
 *   import SEO from '../components/SEO'
 *   import { getPageSEO } from '../data/seoData'
 *
 *   <SEO {...getPageSEO('services')} />
 *   <SEO title="Custom Page" description="..." />
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function SEO({
  title,
  description,
  keywords,
  url,
  type = 'website',
  ogImage,
  noIndex = false,
  schemaData,
  children,
}) {
  // ── Resolve values ──────────────────────────────────────────────────────
  const finalTitle = title
    ? title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Services, Jobs & Gigs Platform in India`

  const finalDescription = description || DEFAULT_DESCRIPTION
  const finalKeywords = keywords || DEFAULT_KEYWORDS
  const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL)
  const finalImage = ogImage || DEFAULT_OG_IMAGE
  const ogType = type === 'jobPosting' || type === 'service' || type === 'profile' ? 'website' : type
  const robotsContent = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  // ── Build schema JSON-LD ────────────────────────────────────────────────
  const schemas = schemaData
    ? Array.isArray(schemaData) ? schemaData : [schemaData]
    : []

  return (
    <Helmet>
      {/* ── Core ────────────────────────────────────────────────────────── */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={robotsContent} />
      <meta name="theme-color" content={SITE_THEME_COLOR} />
      <link rel="canonical" href={finalUrl} />

      {/* ── Open Graph ──────────────────────────────────────────────────── */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:image" content={finalImage} />

      {/* ── Twitter Card ────────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* ── JSON-LD Structured Data ─────────────────────────────────────── */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {children}
    </Helmet>
  )
}
