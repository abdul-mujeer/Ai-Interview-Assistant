'use client'

import { useState, useRef } from 'react'
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react'
import { uploadResume, startInterview } from '@/lib/api'
import { useInterviewStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

export function ResumeUpload() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [resumeId, setResumeId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setResume = useInterviewStore((state) => state.setResume)
  const setLoading = useInterviewStore((state) => state.setLoading)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploadedFile(file)
    setError(null)
    setIsUploading(true)

    try {
      const data = await uploadResume(file)
      console.log('[v0] Resume uploaded:', data)
      
      setResumeId(data.resume_id)
      const skills = data.skills.map((s: any) => s.name)
      setExtractedSkills(skills)
      setResume(data.resume_id, data.skills)
    } catch (err: any) {
      console.error('[v0] Upload error:', err)
      setError(err.response?.data?.detail || 'Failed to upload resume')
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleStartInterview = async () => {
    if (!resumeId) return

    setLoading(true)
    try {
      const interview = await startInterview(resumeId)
      console.log('[v0] Interview started:', interview)
      useInterviewStore.setState({
        interviewId: interview.interview_id,
        questions: interview.questions,
        currentQuestionIndex: 0,
      })
      router.push('/interview/session')
    } catch (err: any) {
      console.error('[v0] Start interview error:', err)
      setError(err.response?.data?.detail || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-semibold text-gray-900">
              Drag and drop your resume
            </p>
            <p className="mt-2 text-sm text-gray-600">
              or click to browse for a PDF file
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Resume uploaded</p>
              <p className="text-sm text-green-700">{uploadedFile.name}</p>
            </div>
          </div>

          {extractedSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Extracted Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleStartInterview}
            disabled={isUploading}
            className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            {isUploading ? 'Processing...' : 'Start Interview'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
