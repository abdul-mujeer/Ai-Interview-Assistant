'use client'

import { InterviewSession } from '@/components/InterviewSession'
import Link from 'next/link'

export default function SessionPage() {
  return (
    <div>
      <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Interview Session</h1>

      <InterviewSession />

      <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-3">📝 Interview Tips:</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Speak clearly and naturally</li>
          <li>• Take a moment to think before answering</li>
          <li>• Provide specific examples and details</li>
          <li>• Don&apos;t worry about perfection - focus on expressing your thoughts</li>
        </ul>
      </div>
    </div>
  )
}
