'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { VoiceRecorder } from './VoiceRecorder'
import { submitAnswer } from '@/lib/api'
import { useInterviewStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

export function InterviewSession() {
  const router = useRouter()
  const {
    interviewId,
    questions,
    currentQuestionIndex,
    setCurrentQuestion,
    addAnswer,
  } = useInterviewStore()

  const [transcript, setTranscript] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  if (!interviewId || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-700">Interview session not found. Please start a new interview.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      setError('Please provide an answer')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      console.log('[v0] Submitting answer...')
      const evaluation = await submitAnswer(
        interviewId,
        currentQuestion.id,
        currentQuestion.text,
        transcript
      )

      console.log('[v0] Answer evaluated:', evaluation)

      // Store answer
      addAnswer({
        questionId: currentQuestion.id,
        transcript,
        score: evaluation.score,
        feedback: evaluation.feedback,
      })

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestion(currentQuestionIndex + 1)
        setTranscript('')
        setAudioBlob(null)
      } else {
        // Interview completed
        router.push(`/interview/results?id=${interviewId}`)
      }
    } catch (err: any) {
      console.error('[v0] Submit error:', err)
      setError(err.response?.data?.detail || 'Failed to submit answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1)
      setTranscript('')
      setAudioBlob(null)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
          {currentQuestion.category} • {currentQuestion.difficulty}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
          {currentQuestion.text}
        </h2>
        <p className="text-sm text-gray-600 mt-4">
          Estimated time: {currentQuestion.estimated_time} seconds
        </p>
      </div>

      {/* Voice Recorder */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Your Answer</h3>
        <VoiceRecorder
          onTranscriptChange={setTranscript}
          onRecordingComplete={setAudioBlob}
          disabled={isSubmitting}
        />
      </div>

      {/* Answer Display */}
      {transcript && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-green-700 mb-2">Your Answer:</p>
          <p className="text-gray-800 text-sm leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePreviousQuestion}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-semibold"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>
        )}

        <button
          onClick={handleSubmitAnswer}
          disabled={isSubmitting || !transcript}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Next Question'}
          {!isSubmitting && <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
