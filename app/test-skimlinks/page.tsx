'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Test page to verify Skimlinks is working
 * Visit: /test-skimlinks
 */
export default function TestSkimlinksPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [skimlinksDetected, setSkimlinksDetected] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // Check if Skimlinks script is loaded
    const checkScript = () => {
      const scripts = Array.from(document.querySelectorAll('script'))
      const skimlinksScript = scripts.find(script => 
        script.src.includes('skimresources.com')
      )
      
      if (skimlinksScript) {
        setScriptLoaded(true)
        setTestResults(prev => [...prev, '✅ Skimlinks script found in DOM'])
      } else {
        setTestResults(prev => [...prev, '❌ Skimlinks script NOT found in DOM'])
      }

      // Check if Skimlinks global object exists (if available)
      if (typeof window !== 'undefined') {
        // @ts-ignore - Skimlinks may add global objects
        if (window.Skimlinks || window.skimlinks) {
          setSkimlinksDetected(true)
          setTestResults(prev => [...prev, '✅ Skimlinks JavaScript detected'])
        } else {
          setTestResults(prev => [...prev, '⚠️ Skimlinks JavaScript not detected (may be normal before approval)'])
        }
      }
    }

    // Wait a bit for script to load
    setTimeout(checkScript, 2000)
    // Also check immediately
    checkScript()
  }, [])

  // Test product links
  const testLinks = [
    { name: 'Amazon Product', url: 'https://www.amazon.com/dp/B08N5WRWNW' },
    { name: 'Target Product', url: 'https://www.target.com/p/-/A-12345678' },
    { name: 'Walmart Product', url: 'https://www.walmart.com/ip/12345678' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skimlinks Verification Test
          </h1>
          <p className="text-gray-600">
            This page helps verify that Skimlinks is properly integrated.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 mb-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Script Status
            </h2>
            <div className={`text-2xl font-bold ${scriptLoaded ? 'text-green-600' : 'text-red-600'}`}>
              {scriptLoaded ? '✅ Loaded' : '❌ Not Found'}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {scriptLoaded 
                ? 'Skimlinks script is present in the page'
                : 'Skimlinks script not detected'}
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              JavaScript Detection
            </h2>
            <div className={`text-2xl font-bold ${skimlinksDetected ? 'text-green-600' : 'text-yellow-600'}`}>
              {skimlinksDetected ? '✅ Active' : '⚠️ Pending'}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {skimlinksDetected
                ? 'Skimlinks JavaScript is running'
                : 'May not activate until account is approved'}
            </p>
          </div>
        </div>

        {/* Test Results */}
        <div className="rounded-lg bg-white p-6 shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Results
          </h2>
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Running checks...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Links */}
        <div className="rounded-lg bg-white p-6 shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test Product Links
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click these links and check the URL in your browser. After approval, 
            Skimlinks will add parameters to the URL (like <code className="bg-gray-100 px-1">?subid=...</code>).
          </p>
          <div className="space-y-3">
            {testLinks.map((link, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {link.name}
                </p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm break-all"
                >
                  {link.url}
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  Right-click → Inspect to see if URL changes after approval
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How to Verify
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>
              <strong>Check Script Loading:</strong> Open browser DevTools (F12) → Network tab → 
              Reload page → Look for request to <code>skimresources.com</code>
            </li>
            <li>
              <strong>Check Console:</strong> DevTools → Console → Look for Skimlinks messages 
              (may be minimal before approval)
            </li>
            <li>
              <strong>Check Links:</strong> Right-click a product link → Copy link address → 
              After approval, you'll see Skimlinks parameters added
            </li>
            <li>
              <strong>After Approval:</strong> Links will automatically convert when clicked. 
              Check Performance tab in Skimlinks dashboard for tracking.
            </li>
          </ol>
        </div>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

