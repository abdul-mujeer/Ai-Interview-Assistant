'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Play, Upload } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  onRecordingComplete: (audioBlob: Blob) => void
  disabled?: boolean
}

export function VoiceRecorder({
  onTranscriptChange,
  onRecordingComplete,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamsRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      console.log('[v0] Starting recording...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      streamsRef.current = []
      setDuration(0)

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          streamsRef.current.push(event.data)
        }
      })

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(streamsRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      })

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds++
        setDuration(seconds)
      }, 1000)

      // Auto-stop after 5 minutes
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording()
        }
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error('[v0] Recording error:', error)
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    console.log('[v0] Stopping recording...')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleTranscribe = async () => {
    if (!audioUrl) return

    setIsProcessing(true)
    try {
      // For now, we'll use a placeholder
      // In production, you'd send this to backend for Whisper transcription
      console.log('[v0] Transcribing audio...')
      
      // Simulated transcription - replace with actual API call
      const simulatedTranscript =
        'This is where the speech-to-text transcription would appear. ' +
        'In production, this would use OpenAI Whisper or similar service.'
      
      setTranscript(simulatedTranscript)
      onTranscriptChange(simulatedTranscript)
    } catch (error) {
      console.error('[v0] Transcription error:', error)
      alert('Failed to transcribe audio')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full">
      {!isRecording && !audioUrl && (
        <button
          onClick={startRecording}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold"
        >
          <Mic className="h-5 w-5" />
          Start Recording
        </button>
      )}

      {isRecording && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-700 font-semibold">Recording...</span>
            </div>
            <span className="text-red-700 font-mono">{formatTime(duration)}</span>
          </div>
          <button
            onClick={stopRecording}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            <Square className="h-5 w-5" />
            Stop Recording
          </button>
        </div>
      )}

      {audioUrl && !transcript && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-semibold">Recording complete</span>
            <span className="text-blue-700 font-mono">{formatTime(duration)}</span>
          </div>
          <button
            onClick={handleTranscribe}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
          >
            <Upload className="h-5 w-5" />
            {isProcessing ? 'Transcribing...' : 'Transcribe Answer'}
          </button>
          <audio
            src={audioUrl}
            controls
            className="w-full rounded-lg"
          />
        </div>
      )}

      {transcript && (
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-700 mb-2">Transcription:</p>
            <p className="text-green-800 text-sm leading-relaxed">{transcript}</p>
          </div>
          <button
            onClick={() => {
              setTranscript('')
              setAudioUrl(null)
              setDuration(0)
            }}
            className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Record Again
          </button>
        </div>
      )}
    </div>
  )
}
