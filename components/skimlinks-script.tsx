/**
 * Skimlinks Script Component
 * 
 * This component adds the Skimlinks JavaScript snippet to automatically
 * convert product links to affiliate links.
 * 
 * Get your Skimlinks ID from: https://hub.skimlinks.com/snapshot
 */

import Script from 'next/script'

export function SkimlinksScript() {
  // Get Skimlinks ID from environment variable
  // Default to the one from your Skimlinks dashboard: 295544
  const skimlinksId = process.env.NEXT_PUBLIC_SKIMLINKS_ID || '295544'

  // Only render in production or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_SKIMLINKS_ENABLED) {
    return null
  }

  return (
    <Script
      src={`https://s.skimresources.com/js/${skimlinksId}`}
      strategy="afterInteractive"
    />
  )
}

