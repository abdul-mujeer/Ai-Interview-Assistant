import { create } from 'zustand'

export interface Skill {
  name: string
  level: string
  category: string
}

export interface Question {
  id: string
  question_number: number
  text: string
  category: string
  difficulty: string
  estimated_time: number
}

export interface Answer {
  questionId: string
  transcript: string
  score: number
  feedback: string
}

export interface InterviewState {
  // Resume
  resumeId: string | null
  skills: Skill[]
  setResume: (resumeId: string, skills: Skill[]) => void

  // Interview Session
  interviewId: string | null
  questions: Question[]
  currentQuestionIndex: number
  answers: Answer[]
  setInterview: (interviewId: string, questions: Question[]) => void
  setCurrentQuestion: (index: number) => void
  addAnswer: (answer: Answer) => void

  // Results
  overallScore: number | null
  weakAreas: string[]
  setResults: (score: number, weakAreas: string[]) => void

  // UI State
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Reset
  reset: () => void
}

export const useInterviewStore = create<InterviewState>((set) => ({
  // Resume
  resumeId: null,
  skills: [],
  setResume: (resumeId, skills) => set({ resumeId, skills }),

  // Interview
  interviewId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  setInterview: (interviewId, questions) =>
    set({ interviewId, questions, currentQuestionIndex: 0 }),
  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),

  // Results
  overallScore: null,
  weakAreas: [],
  setResults: (overallScore, weakAreas) => set({ overallScore, weakAreas }),

  // UI
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Reset
  reset: () =>
    set({
      resumeId: null,
      skills: [],
      interviewId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      overallScore: null,
      weakAreas: [],
      isLoading: false,
      error: null,
    }),
}))
