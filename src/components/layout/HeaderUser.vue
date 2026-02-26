<template>
  <header class="bg-white py-4 px-6 mb-8 flex items-center justify-between rounded-xl shadow-sm border border-gray-100">
    <div class="flex items-center gap-3">
      <img 
        v-if="user?.avatar && !imageError" 
        :src="user.avatar" 
        alt="Avatar" 
        class="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
        @error="imageError = true"
      />
      <div v-else class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-400">
        <UserIcon class="w-6 h-6" />
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
import { ref, watch } from 'vue'
import { User as UserIcon } from 'lucide-vue-next'
import type { GoogleUser } from '@/types'

const props = defineProps<{
  user: GoogleUser | null
}>()

defineEmits<{
  (e: 'logout'): void
}>()

const imageError = ref(false)

watch(() => props.user?.avatar, () => {
  imageError.value = false
})
</script>
