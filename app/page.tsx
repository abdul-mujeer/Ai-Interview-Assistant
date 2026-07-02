import Link from 'next/link'
import { Zap, BarChart3, Mic, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Interview Assistant</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Practice interviews with{' '}
            <span className="text-blue-600">AI-powered feedback</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your resume, get personalized interview questions, record your answers, and receive detailed feedback with an improvement plan.
          </p>
          <Link href="/interview/upload-resume">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg">
              Start Your Interview Now →
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            {
              icon: CheckCircle,
              title: 'Resume Analysis',
              description: 'AI extracts skills from your resume automatically',
            },
            {
              icon: Zap,
              title: 'Smart Questions',
              description: 'Get relevant questions tailored to your skills',
            },
            {
              icon: Mic,
              title: 'Voice Recording',
              description: 'Record answers and get instant transcriptions',
            },
            {
              icon: BarChart3,
              title: 'Detailed Feedback',
              description: 'Get scores, weak areas, and improvement plans',
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <Icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Upload Resume', description: 'Share your PDF resume' },
              { step: 2, title: 'Get Questions', description: 'AI generates relevant questions' },
              { step: 3, title: 'Record Answers', description: 'Speak your answers naturally' },
              { step: 4, title: 'Get Feedback', description: 'Receive detailed improvement plan' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16 mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to ace your interviews?</h3>
          <p className="text-lg mb-8 text-blue-100">
            Start practicing with AI feedback today. It only takes 5 minutes.
          </p>
          <Link href="/interview/upload-resume">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Begin Your Interview →
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            AI Interview Assistant • Powered by GPT-4 and Whisper
          </p>
        </div>
      </div>
    </main>
  )
}
