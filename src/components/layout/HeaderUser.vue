<template>
  <header class="bg-white py-4 px-6 mb-8 flex items-center justify-between rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center gap-3">
      <img 
        v-if="user?.avatar" 
        :src="user.avatar" 
        alt="Avatar" 
        class="w-10 h-10 rounded-full border-2 border-white shadow-sm"
      />
      <div v-else class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
        {{ user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U' }}
      </div>
      
      <div class="flex flex-col">
        <span class="font-bold text-gray-800 text-sm">{{ user?.name || 'Usuário' }}</span>
        <span class="text-xs text-gray-500">{{ user?.email }}</span>
      </div>
    </div>
    
    <button 
      @click="$emit('logout')" 
      class="px-4 py-1.5 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
    >
      Sair
    </button>
  </header>
</template>

<script setup lang="ts">
import type { GoogleUser } from '@/types'

defineProps<{
  user: GoogleUser | null
}>()

defineEmits<{
  (e: 'logout'): void
}>()
</script>
