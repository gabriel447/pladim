import type { UserState } from '@/types'

const PREFIX = 'pladim_data_'

const getKey = (email: string) => `${PREFIX}${email}`

export const saveStorage = (email: string, data: UserState) => {
  if (!email) return
  try {
    localStorage.setItem(getKey(email), JSON.stringify(data))
  } catch (error) {
    console.error('Erro ao salvar:', error)
  }
}

export const loadStorage = (email: string): UserState | null => {
  if (!email) return null
  try {
    const data = localStorage.getItem(getKey(email))
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erro ao carregar:', error)
    return null
  }
}

export const clearStorage = (email: string) => {
  if (!email) return
  localStorage.removeItem(getKey(email))
}
