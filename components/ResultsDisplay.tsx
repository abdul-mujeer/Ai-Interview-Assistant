'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { getResults, generateImprovementPlan } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface ResultsDisplayProps {
  interviewId: string
}

export function ResultsDisplay({ interviewId }: ResultsDisplayProps) {
  const router = useRouter()
  const [results, setResults] = useState<any>(null)
  const [improvementPlan, setImprovementPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadResults = async () => {
      try {
        console.log('[v0] Loading interview results...')
        const resultsData = await getResults(interviewId)
        setResults(resultsData)

        console.log('[v0] Generating improvement plan...')
        const planData = await generateImprovementPlan(interviewId)
        setImprovementPlan(planData)
      } catch (err: any) {
        console.error('[v0] Results error:', err)
        setError(err.response?.data?.detail || 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [interviewId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const scoreColor =
    results.overall_score >= 80
      ? 'text-green-600'
      : results.overall_score >= 60
      ? 'text-yellow-600'
      : 'text-red-600'

  const scoreBg =
    results.overall_score >= 80
      ? 'bg-green-50 border-green-200'
      : results.overall_score >= 60
      ? 'bg-yellow-50 border-yellow-200'
      : 'bg-red-50 border-red-200'

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Overall Score */}
      <div className={`border rounded-lg p-8 text-center ${scoreBg}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Results</h2>
        <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
          {Math.round(results.overall_score)}
        </div>
        <p className="text-gray-600">
          {results.overall_score >= 80 && 'Excellent! Great interview performance.'}
          {results.overall_score >= 60 && results.overall_score < 80 && 'Good effort! Room for improvement.'}
          {results.overall_score < 60 && 'Keep practicing! You can improve.'}
        </p>
      </div>

      {/* Question Breakdown */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Question Breakdown</h3>
        <div className="space-y-3">
          {results.answers &&
            results.answers.map((answer: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Question {idx + 1}</p>
                  <p className="text-sm text-gray-600 mt-1">{answer.feedback}</p>
                </div>
                <div className="ml-4 text-right">
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round(answer.score)}
                  </span>
                  <span className="text-xs text-gray-600 block">/100</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Weak Areas */}
      {results.weak_areas && results.weak_areas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            Areas for Improvement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.weak_areas.map((area: string, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="font-semibold text-yellow-900">{area}</p>
                {results.weak_area_details?.[area] && (
                  <p className="text-sm text-yellow-800 mt-2">
                    Score: {results.weak_area_details[area].score}/100
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Plan */}
      {improvementPlan && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Your Improvement Plan
          </h3>

          {improvementPlan.timeline && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Recommended Timeline</p>
              <p className="text-lg font-semibold text-blue-900">
                {improvementPlan.timeline}
              </p>
            </div>
          )}

          {improvementPlan.recommendations &&
            Object.entries(improvementPlan.recommendations).map(
              ([area, recommendations]: [string, any]) => (
                <div key={area} className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{area}</h4>
                  <ul className="space-y-2">
                    {Array.isArray(recommendations) &&
                      recommendations.map((rec: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-gray-700"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )
            )}

          {improvementPlan.next_steps && improvementPlan.next_steps.length > 0 && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Next Steps</h4>
              <ol className="space-y-2">
                {improvementPlan.next_steps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="font-semibold text-purple-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <button
          onClick={() => router.push('/')}
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          Back to Home
        </button>
        <button
          onClick={() => router.push('/interview/upload-resume')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Try Another Interview
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
