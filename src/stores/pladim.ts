/**
 * Gerencia o estado global da aplicação (Tarefas, Recompensas, Pontuação, Usuário) usando Pinia.
 */
import { defineStore } from 'pinia'
import type { Task, Reward, UserState, GoogleUser } from '@/types'
import { loadStorage, saveStorage } from '@/services/storage'
import { useToast } from '@/components/ui/ToastContainer.vue'

const SESSION_KEY = 'pladim_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 

export const usePladimStore = defineStore('pladim', {
  state: () => ({
    user: null as GoogleUser | null,
    userEmail: null as string | null,
    tasks: [] as Task[],
    rewards: [] as Reward[],
    balancePrevious: 0,
    spentPoints: 0,
  }),

  getters: {
    pointsThisWeek: (state): number => 
      state.tasks.reduce((total, task) => {
        const days = task.completedDays.filter(Boolean).length
        return total + (days * task.points)
      }, 0),

    totalBalance(state): number {
      return (this.balancePrevious + this.pointsThisWeek) - state.spentPoints
    },
    
    userState(state): UserState {
      return {
        tasks: state.tasks,
        rewards: state.rewards,
        balancePrevious: state.balancePrevious,
        spentPoints: state.spentPoints
      }
    }
  },

  actions: {
    setUser(user: GoogleUser) {
      this.user = user
      this.init(user.email)
      
      const expiry = Date.now() + SESSION_DURATION
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiry }))
    },

    checkSession() {
      const data = localStorage.getItem(SESSION_KEY)
      if (!data) return false
      
      try {
        const { user, expiry } = JSON.parse(data)
        if (Date.now() < expiry) {
          this.user = user
          this.init(user.email)
          return true
        }
      } catch {}
      
      this.logout()
      return false
    },

    logout() {
      this.$reset()
      localStorage.removeItem(SESSION_KEY)
    },

    init(email: string) {
      if (!email) return
      this.userEmail = email
      
      const loaded = loadStorage(email)
      
      if (loaded) {
        this.tasks = loaded.tasks || []
        this.rewards = loaded.rewards || []
        this.balancePrevious = loaded.balancePrevious || 0
        this.spentPoints = loaded.spentPoints || 0
      } else {
        this.seedInitialData()
      }
    },

    save() {
      if (this.userEmail) {
        saveStorage(this.userEmail, this.userState)
      }
    },

    addTask(title: string, points: number) {
      this.tasks.push({
        id: crypto.randomUUID(),
        title,
        points,
        completedDays: Array(7).fill(false),
        createdAt: Date.now()
      })
      this.save()
      useToast().add({ title: 'Sucesso', message: 'Tarefa criada!', type: 'success' })
    },

    removeTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.save()
      useToast().add({ title: 'Sucesso', message: 'Tarefa removida!', type: 'success' })
    },

    updateTask(id: string, updates: Partial<Task>) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        Object.assign(task, updates)
        this.save()
      }
    },

    toggleDay(taskId: string, dayIndex: number) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.completedDays[dayIndex] = !task.completedDays[dayIndex]
        this.save()
      }
    },

    addReward(title: string, points: number) {
      this.rewards.push({
        id: crypto.randomUUID(),
        title,
        points,
        redeemedCount: 0,
        createdAt: Date.now()
      })
      this.save()
      useToast().add({ title: 'Sucesso', message: 'Recompensa criada!', type: 'success' })
    },

    removeReward(id: string) {
      this.rewards = this.rewards.filter(r => r.id !== id)
      this.updateSpent()
      this.save()
      useToast().add({ title: 'Sucesso', message: 'Recompensa removida!', type: 'success' })
    },

    updateReward(id: string, updates: Partial<Reward>) {
      const reward = this.rewards.find(r => r.id === id)
      if (reward) {
        Object.assign(reward, updates)
        this.save()
      }
    },

    incrementReward(rewardId: string) {
      const reward = this.rewards.find(r => r.id === rewardId)
      if (!reward) return

      if (this.totalBalance >= reward.points) {
        reward.redeemedCount++
        this.spentPoints += reward.points
        this.save()
        useToast().add({ 
          title: 'Resgatado!', 
          message: `Você pegou "${reward.title}"`, 
          type: 'success' 
        })
      } else {
        useToast().add({ 
          title: 'Saldo insuficiente', 
          message: 'Faltam pontos para essa recompensa.', 
          type: 'error' 
        })
      }
    },

    decrementReward(rewardId: string) {
      const reward = this.rewards.find(r => r.id === rewardId)
      if (reward && reward.redeemedCount > 0) {
        reward.redeemedCount--
        this.spentPoints -= reward.points
        this.save()
      }
    },
    
    updateSpent() {
      this.spentPoints = this.rewards.reduce((total, r) => total + (r.points * r.redeemedCount), 0)
    },

    closeWeek() {
      this.balancePrevious = this.totalBalance
      this.tasks.forEach(t => t.completedDays = Array(7).fill(false))
      this.rewards.forEach(r => r.redeemedCount = 0)
      this.spentPoints = 0
      this.save()
      
      useToast().add({ 
        title: 'Semana fechada!', 
        message: 'Saldo atualizado com sucesso.', 
        type: 'success' 
      })
    },

    resetData() {
      this.tasks = []
      this.rewards = []
      this.balancePrevious = 0
      this.spentPoints = 0
      this.save()
    },

    seedInitialData() {
      this.tasks = [
        { id: '1', title: 'Academia', points: 100, completedDays: Array(7).fill(false), createdAt: Date.now() },
        { id: '2', title: 'Leitura', points: 200, completedDays: Array(7).fill(false), createdAt: Date.now() },
        { id: '3', title: 'Estudar', points: 50, completedDays: Array(7).fill(false), createdAt: Date.now() },
      ]
      this.rewards = [
        { id: '1', title: 'Pizza', points: 2000, redeemedCount: 0, createdAt: Date.now() },
        { id: '2', title: 'Cinema', points: 1000, redeemedCount: 0, createdAt: Date.now() },
      ]
      this.balancePrevious = 0
      this.spentPoints = 0
      this.save()
    }
  }
})
