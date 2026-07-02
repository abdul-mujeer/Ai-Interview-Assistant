'use client'

import { Suspense } from 'react'
import { ResultsDisplay } from '@/components/ResultsDisplay'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResultsContent() {
  const searchParams = useSearchParams()
  const interviewId = searchParams.get('id')

  if (!interviewId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
        <p className="text-gray-600 mb-6">
          Could not find your interview results. Please start a new interview.
        </p>
        <Link href="/interview/upload-resume">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start New Interview
          </button>
        </Link>
      </div>
    )
  }

  return <ResultsDisplay interviewId={interviewId} />
}

export default function ResultsPage() {
  return (
    <div>
      <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Interview Results & Improvement Plan</h1>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your results...</p>
            </div>
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </div>
  )
}
