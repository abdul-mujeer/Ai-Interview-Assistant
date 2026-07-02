import { ResumeUpload } from '@/components/ResumeUpload'
import Link from 'next/link'

export const metadata = {
  title: 'Upload Resume - AI Interview Assistant',
  description: 'Upload your resume to get started with your AI interview practice session',
}

export default function UploadResumePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600">
          Share your resume so we can extract your skills and generate personalized interview questions.
        </p>
      </div>

      <ResumeUpload />

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for best results:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use a clear, well-formatted PDF resume</li>
          <li>• Include all relevant skills and experiences</li>
          <li>• Keep your resume to 1-2 pages for better parsing</li>
          <li>• Make sure skills are explicitly mentioned</li>
        </ul>
      </div>
    </div>
  )
}
