import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('[API Error]', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

// ==================== Resume API ====================

export const uploadResume = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await apiClient.post('/api/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getResume = async (resumeId: string) => {
  const response = await apiClient.get(`/api/resume/${resumeId}`)
  return response.data
}

// ==================== Interview API ====================

export const startInterview = async (resumeId: string, userId?: string) => {
  const response = await apiClient.post('/api/interview/start', {
    resume_id: resumeId,
    user_id: userId,
  })
  return response.data
}

export const getInterview = async (interviewId: string) => {
  const response = await apiClient.get(`/api/interview/${interviewId}`)
  return response.data
}

export const submitAnswer = async (
  interviewId: string,
  questionId: string,
  questionText: string,
  answerTranscript: string
) => {
  const response = await apiClient.post(
    `/api/interview/${interviewId}/submit-answer`,
    {
      interview_id: interviewId,
      question_id: questionId,
      question_text: questionText,
      answer_transcript: answerTranscript,
    }
  )
  return response.data
}

export const completeInterview = async (interviewId: string) => {
  const response = await apiClient.post(`/api/interview/${interviewId}/complete`)
  return response.data
}

export const getResults = async (interviewId: string) => {
  const response = await apiClient.get(`/api/interview/${interviewId}/results`)
  return response.data
}

export const generateImprovementPlan = async (interviewId: string) => {
  const response = await apiClient.post(
    `/api/interview/${interviewId}/improvement-plan`
  )
  return response.data
}

// ==================== Health Check ====================

export const healthCheck = async () => {
  const response = await apiClient.get('/api/health')
  return response.data
}
