<!--
  Componente de exibição do placar. Mostra o saldo atual, pontos da semana e permite fechar a semana.
-->
<template>
  <div class="bg-gray-100/50 p-6 rounded-xl h-fit">
    <div class="flex items-center gap-2 mb-6">
      <Star class="w-6 h-6 text-amber-400 fill-amber-400" />
      <h2 class="text-xl font-bold text-gray-800">Pontuação</h2>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center text-gray-600">
        <span>Saldo Anterior</span>
        <span class="font-medium">{{ balancePrevious }}</span>
      </div>
      
      <div class="flex justify-between items-center text-gray-600">
        <span>Pontos da Semana</span>
        <span class="font-medium text-green-600">+{{ pointsThisWeek }}</span>
      </div>

      <!-- Separator -->
      <div class="h-px bg-gray-200 my-4"></div>

      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-700">Pontos Acumulados</span>
        <div class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold text-xl">
          {{ totalBalance }}
        </div>
      </div>

      <button 
        @click="$emit('close-week')"
        class="w-full mt-6 bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm cursor-pointer focus:outline-none focus:bg-teal-800"
      >
        Fechar Semana e Salvar Pontos
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps({
  balancePrevious: {
    type: Number,
    required: true
  },
  pointsThisWeek: {
    type: Number,
    required: true
  },
  totalBalance: {
    type: Number,
    required: true
  }
})

defineEmits(['close-week'])
</script>
