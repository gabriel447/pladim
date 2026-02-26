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
  scheduledDays: number[]
  completedDates: string[]
  createdAt: number
}

export interface Reward {
  id: string
  title: string
  points: number
  createdAt: number
}

export interface Purchase {
  id: string
  rewardId: string
  rewardTitle: string
  cost: number
  purchasedAt: number
}

export interface UserState {
  tasks: Task[]
  rewards: Reward[]
  purchases: Purchase[]
  legacyBalance: number
}

export interface PladimStoreState extends UserState {
  userEmail: string | null
}

export type TabType = 'agenda' | 'tasks' | 'rewards'
