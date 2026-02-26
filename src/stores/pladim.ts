import { defineStore } from 'pinia'
import type { Task, Reward, UserState, GoogleUser, Purchase } from '@/types'
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
    purchases: [] as Purchase[],
    legacyBalance: 0,
  }),

  getters: {
    pointsFromTasks: (state): number => 
      state.tasks.reduce((total, task) => {
        return total + (task.completedDates.length * task.points)
      }, 0),

    spentPoints: (state): number =>
      state.purchases.reduce((total, purchase) => total + purchase.cost, 0),

    totalBalance(state): number {
      return (state.legacyBalance + this.pointsFromTasks) - this.spentPoints
    },
    
    userState(state): UserState {
      return {
        tasks: state.tasks,
        rewards: state.rewards,
        purchases: state.purchases,
        legacyBalance: state.legacyBalance
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
      
      const loaded: any = loadStorage(email)
      
      if (loaded) {
        if (Array.isArray(loaded.tasks) && loaded.tasks.length > 0 && 'completedDays' in loaded.tasks[0]) {
            this.migrateOldData(loaded)
        } else {
            this.tasks = loaded.tasks || []
            this.rewards = loaded.rewards || []
            this.purchases = loaded.purchases || []
            this.legacyBalance = loaded.legacyBalance || 0
            
          this.consolidatePoints()
          
          if (this.totalBalance < 0) {
              this.legacyBalance = 0
              this.tasks.forEach(t => t.completedDates = []) 
              const earned = this.pointsFromTasks
              const spent = this.spentPoints
              if (spent > earned + this.legacyBalance) {
                  this.legacyBalance = spent - earned
              }
          }
        }
      } else {
        this.seedInitialData()
      }
    },

    consolidatePoints() {
        import('date-fns').then(({ startOfWeek, isBefore, parseISO, format }) => {
            const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
            let pointsToMigrate = 0
            let changed = false

            this.tasks.forEach(task => {
                const remainingDates: string[] = []
                task.completedDates.forEach(dateStr => {
                    const date = parseISO(dateStr)
                    if (isBefore(date, currentWeekStart)) {
                        pointsToMigrate += task.points
                        changed = true
                    } else {
                        remainingDates.push(dateStr)
                    }
                })
                task.completedDates = remainingDates
            })

            if (changed) {
                this.legacyBalance += pointsToMigrate
                this.save()
            }
        })
    },

    migrateOldData(oldData: any) {
        let oldPoints = oldData.balancePrevious || 0
        
        if (oldData.tasks) {
            oldData.tasks.forEach((t: any) => {
                if (t.completedDays) {
                    const days = t.completedDays.filter(Boolean).length
                    oldPoints += (days * t.points)
                }
            })
        }
        
        const oldSpent = oldData.spentPoints || 0
        const finalBalance = oldPoints - oldSpent
        
        this.legacyBalance = finalBalance > 0 ? finalBalance : 0
        this.purchases = [] 
        this.rewards = oldData.rewards.map((r: any) => ({
            id: r.id,
            title: r.title,
            points: r.points,
            createdAt: r.createdAt
        }))
        this.tasks = oldData.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            points: t.points,
            scheduledDays: [0, 1, 2, 3, 4, 5, 6], 
            completedDates: [], 
            createdAt: t.createdAt
        }))
        
        this.save()
        useToast().add({ title: 'Atualizado', message: 'Sistema atualizado! Seus pontos foram preservados.', type: 'info' })
    },

    save() {
      if (this.userEmail) {
        saveStorage(this.userEmail, this.userState)
      }
    },

    addTask(title: string, points: number, scheduledDays: number[]) {
      this.tasks.push({
        id: crypto.randomUUID(),
        title,
        points,
        scheduledDays,
        completedDates: [],
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

    toggleTaskDate(taskId: string, dateString: string) {
        const task = this.tasks.find(t => t.id === taskId)
        if (task) {
            const index = task.completedDates.indexOf(dateString)
            if (index > -1) {
                task.completedDates.splice(index, 1)
            } else {
                task.completedDates.push(dateString)
            }
            this.save()
        }
    },

    addReward(title: string, points: number) {
      this.rewards.push({
        id: crypto.randomUUID(),
        title,
        points,
        createdAt: Date.now()
      })
      this.save()
      useToast().add({ title: 'Sucesso', message: 'Recompensa criada!', type: 'success' })
    },

    removeReward(id: string) {
      this.rewards = this.rewards.filter(r => r.id !== id)
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

    purchaseReward(reward: Reward) {
        if (this.totalBalance >= reward.points) {
            this.purchases.push({
                id: crypto.randomUUID(),
                rewardId: reward.id,
                rewardTitle: reward.title,
                cost: reward.points,
                purchasedAt: Date.now()
            })
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

    resetData() {
      this.tasks = []
      this.rewards = []
      this.purchases = []
      this.legacyBalance = 0
      this.save()
    },

    seedInitialData() {
      this.tasks = [
        { 
            id: '1', 
            title: 'Academia', 
            points: 100, 
            scheduledDays: [1, 3, 5], 
            completedDates: [], 
            createdAt: Date.now() 
        },
        { 
            id: '2', 
            title: 'Leitura', 
            points: 50, 
            scheduledDays: [0, 1, 2, 3, 4, 5, 6], 
            completedDates: [], 
            createdAt: Date.now() 
        },
      ]
      this.rewards = [
        { id: '1', title: 'Pizza', points: 2000, createdAt: Date.now() },
        { id: '2', title: 'Cinema', points: 1000, createdAt: Date.now() },
      ]
      this.purchases = []
      this.legacyBalance = 0
      this.save()
    }
  }
})
