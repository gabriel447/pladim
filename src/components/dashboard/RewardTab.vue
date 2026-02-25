<!--
  Componente de lista de recompensas. Responsável por exibir, adicionar, remover, editar e resgatar recompensas.
-->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="grid grid-cols-12 gap-4 bg-gray-100/80 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
      <div class="col-span-6">Nome</div>
      <div class="col-span-2 text-center">Pontos</div>
      <div class="col-span-3 text-center">Qtd</div>
      <div class="col-span-1"></div>
    </div>

    <div class="divide-y divide-gray-100">
      <div v-for="reward in rewards" :key="reward.id" class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group">
        <div class="col-span-6 font-medium text-gray-800 relative group/edit">
          <div v-if="editId === reward.id" class="flex items-center">
            <input 
              ref="nameInput"
              v-model="editName"
              type="text"
              class="w-full px-2 py-1 rounded border border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              @blur="saveName(reward)"
              @keyup.enter="saveName(reward)"
              @keyup.esc="cancelEdit"
            >
          </div>
          <div 
            v-else 
            @click="startEdit(reward)"
            class="cursor-pointer hover:text-teal-700 py-1 transition-colors"
            title="Clique para editar"
          >
            <span class="truncate">{{ reward.title }}</span>
          </div>
        </div>
        
        <div class="col-span-2 text-center font-semibold text-gray-600 relative group/edit-points">
          <div v-if="editPointsId === reward.id" class="flex items-center justify-center">
            <input 
              ref="pointsInput"
              v-model.number="editPoints"
              type="number"
              class="w-16 px-1 py-1 text-center rounded border border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @blur="savePoints(reward)"
              @keyup.enter="savePoints(reward)"
              @keyup.esc="cancelPoints"
            >
          </div>
          <div 
            v-else 
            @click="startEditPoints(reward)"
            class="cursor-pointer hover:text-teal-700 py-1 transition-colors"
            title="Clique para editar pontos"
          >
            {{ reward.points }}
          </div>
        </div>
        
        <div class="col-span-3 flex items-center justify-center gap-3">
          <button 
            @click="$emit('decrement', reward.id)"
            class="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            :disabled="reward.redeemedCount === 0"
          >
            <Minus class="w-4 h-4" />
          </button>
          
          <span class="font-medium text-gray-700 w-6 text-center">{{ reward.redeemedCount }}</span>
          
          <button 
            @click="$emit('increment', reward.id)"
            class="w-8 h-8 rounded-full bg-teal-700 text-white hover:bg-teal-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
        
        <div class="col-span-1 flex justify-end">
          <button 
            @click="askRemove(reward.id)" 
            class="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer"
            title="Excluir recompensa"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="rewards.length === 0" class="px-6 py-8 text-center text-gray-400">
        Nenhuma recompensa cadastrada.
      </div>
    </div>

    <div class="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
      <div class="flex gap-3">
        <input 
          v-model="newName" 
          type="text" 
          placeholder="Nome da nova recompensa"
          class="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          @keyup.enter="add"
        >
        <input 
          v-model.number="newPoints" 
          type="number" 
          placeholder="Pontos"
          class="w-24 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          @keyup.enter="add"
        >
        <button 
          @click="add"
          class="px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:bg-teal-800"
          :disabled="!newName"
        >
          Adicionar
        </button>
      </div>
    </div>

    <ConfirmModal 
      ref="confirmRef"
      title="Excluir Recompensa"
      message="Tem certeza que deseja excluir esta recompensa?"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      type="danger"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Plus, Minus, Trash2 } from 'lucide-vue-next'
import type { Reward } from '@/types'
import type { PropType } from 'vue'
import { usePladimStore } from '@/stores/pladim'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

defineProps({
  rewards: {
    type: Array as PropType<Reward[]>,
    required: true
  }
})

const emit = defineEmits(['add', 'remove', 'increment', 'decrement'])
const store = usePladimStore()

const newName = ref('')
const newPoints = ref<number | ''>('')
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
const removeId = ref<string | null>(null)

const editId = ref<string | null>(null)
const editName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const startEdit = (reward: Reward) => {
  editId.value = reward.id
  editName.value = reward.title
  nextTick(() => {
    const el = Array.isArray(nameInput.value) ? nameInput.value[0] : nameInput.value
    el?.focus()
  })
}

const saveName = (reward: Reward) => {
  if (editId.value === reward.id && editName.value.trim()) {
    store.updateReward(reward.id, { title: editName.value })
    editId.value = null
  }
}

const cancelEdit = () => editId.value = null

const editPointsId = ref<string | null>(null)
const editPoints = ref<number | ''>('')
const pointsInput = ref<HTMLInputElement | null>(null)

const startEditPoints = (reward: Reward) => {
  editPointsId.value = reward.id
  editPoints.value = reward.points
  nextTick(() => {
    const el = Array.isArray(pointsInput.value) ? pointsInput.value[0] : pointsInput.value
    el?.focus()
  })
}

const savePoints = (reward: Reward) => {
  if (editPointsId.value === reward.id && editPoints.value !== '') {
    store.updateReward(reward.id, { points: Number(editPoints.value) })
    editPointsId.value = null
  }
}

const cancelPoints = () => editPointsId.value = null

const add = () => {
  if (newName.value && newPoints.value) {
    emit('add', { title: newName.value, points: Number(newPoints.value) })
    newName.value = ''
    newPoints.value = ''
  }
}

const askRemove = (id: string) => {
  removeId.value = id
  confirmRef.value?.open()
}

const remove = () => {
  if (removeId.value) {
    emit('remove', removeId.value)
    removeId.value = null
  }
}
</script>
