<!--
  Visão principal do painel (Dashboard). Organiza e conecta os componentes de Tarefas, Recompensas e Placar com os dados da Store.
-->
<template>
  <div class="min-h-screen bg-gray-50 pb-20 font-sans">
    <main class="max-w-6xl mx-auto px-6 py-8"> 
      <HeaderUser :user="store.user" @logout="handleLogout" />
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Planejador de Tarefas</h1>
        <p class="text-gray-500">Transforme sua rotina em um jogo e conquiste suas metas.</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="flex rounded-t-xl overflow-hidden border-b border-gray-200">
            <button 
              @click="activeTab = 'tasks'"
              class="flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-colors cursor-pointer"
              :class="activeTab === 'tasks' ? 'bg-gray-50 text-teal-700 border-b-2 border-teal-600' : 'bg-white text-gray-500 hover:bg-gray-50'"
            >
              <ClipboardList class="w-5 h-5" />
              Tarefas
            </button>
            <button 
              @click="activeTab = 'rewards'"
              class="flex-1 py-4 flex items-center justify-center gap-2 font-semibold text-sm transition-colors cursor-pointer"
              :class="activeTab === 'rewards' ? 'bg-gray-50 text-red-600 border-b-2 border-red-500' : 'bg-white text-gray-500 hover:bg-gray-50'"
            >
              <Gift class="w-5 h-5" />
              Recompensas
            </button>
          </div>
          <div class="bg-white rounded-b-xl shadow-sm">
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
              mode="out-in"
            >
              <div v-if="activeTab === 'tasks'" key="tasks">
                <TaskTab 
                  :tasks="store.tasks"
                  @add="handleAddTask"
                  @remove="store.removeTask"
                  @toggle-day="store.toggleDay"
                />
              </div>
              <div v-else key="rewards">
                <RewardTab 
                  :rewards="store.rewards"
                  @add="handleAddReward"
                  @remove="store.removeReward"
                  @increment="store.incrementReward"
                  @decrement="store.decrementReward"
                />
              </div>
            </Transition>
          </div>

        </div>
        <div class="lg:col-span-1">
          <ScorePanel 
            :balance-previous="store.balancePrevious"
            :points-this-week="store.pointsThisWeek"
            :total-balance="store.totalBalance"
            @close-week="handleCloseWeek"
          />
        </div>
      </div>
      <ConfirmModal 
        ref="confirmModalRef"
        title="Fechar Semana"
        message="Deseja fechar a semana? Os pontos da semana serão somados ao saldo anterior e o progresso das tarefas será resetado."
        confirm-text="Sim, fechar semana"
        cancel-text="Cancelar"
        @confirm="store.closeWeek"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, Gift } from 'lucide-vue-next'
import { usePladimStore } from '@/stores/pladim'

import HeaderUser from '@/components/layout/HeaderUser.vue'
import ScorePanel from '@/components/dashboard/ScorePanel.vue'
import TaskTab from '@/components/dashboard/TaskTab.vue'
import RewardTab from '@/components/dashboard/RewardTab.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const router = useRouter()
const store = usePladimStore()
const activeTab = ref<'tasks' | 'rewards'>('tasks')
const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

const handleLogout = () => {
  store.logout()
  router.push('/')
}

const handleAddTask = (payload: { title: string, points: number }) => {
  store.addTask(payload.title, payload.points)
}

const handleAddReward = (payload: { title: string, points: number }) => {
  store.addReward(payload.title, payload.points)
}

const handleCloseWeek = () => {
  if (confirmModalRef.value) {
    confirmModalRef.value.open()
  }
}
</script>
