<!--
  Componente de cabeçalho do usuário. Exibe informações do usuário logado e botão de logout.
-->
<template>
  <header class="bg-white py-4 px-6 mb-8 flex items-center justify-between rounded-xl">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
      <span class="font-semibold text-gray-800">{{ user?.email }}</span>
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
import type { PropType } from 'vue'
import type { GoogleUser } from '@/types'

defineProps({
  user: {
    type: Object as PropType<GoogleUser | null>,
    default: null
  }
})

defineEmits(['logout'])
</script>
