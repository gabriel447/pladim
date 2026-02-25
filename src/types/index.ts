/**
 * Definições de tipos TypeScript globais (Interfaces) para Tarefas, Recompensas e Usuário.
 */

export interface GoogleUser {
  email: string
  name: string
  avatar: string
  googleId: string
}

export interface Task {
  id: string
  title: string
  points: number
  completedDays: boolean[] 
  createdAt: number
}

export interface Reward {
  id: string
  title: string
  points: number
  redeemedCount: number
  createdAt: number
}

export interface UserState {
  tasks: Task[]
  rewards: Reward[]
  balancePrevious: number
  spentPoints: number
}

export interface PladimStoreState extends UserState {
  userEmail: string | null
}

export type TabType = 'tasks' | 'rewards'
