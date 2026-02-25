<!--
  Componente de lista de tarefas. Responsável por exibir, adicionar, remover e editar tarefas, além de marcar dias concluídos.
-->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="grid grid-cols-12 gap-4 bg-gray-100/80 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
      <div class="col-span-3">Nome</div>
      <div class="col-span-1 text-center">Seg</div>
      <div class="col-span-1 text-center">Ter</div>
      <div class="col-span-1 text-center">Qua</div>
      <div class="col-span-1 text-center">Qui</div>
      <div class="col-span-1 text-center">Sex</div>
      <div class="col-span-1 text-center">Sáb</div>
      <div class="col-span-1 text-center">Dom</div>
      <div class="col-span-1 text-center">Pts</div>
      <div class="col-span-1 text-center"></div>
    </div>

    <div class="divide-y divide-gray-100">
      <div v-for="task in tasks" :key="task.id" class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group">
        <div class="col-span-3 font-medium text-gray-800 relative group/edit">
          <div v-if="editId === task.id" class="flex items-center">
            <input 
              ref="nameInput"
              v-model="editName"
              type="text"
              class="w-full px-2 py-1 rounded border border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              @blur="saveName(task)"
              @keyup.enter="saveName(task)"
              @keyup.esc="cancelEdit"
            >
          </div>
          <div 
            v-else 
            @click="startEdit(task)"
            class="cursor-pointer hover:text-teal-700 py-1 transition-colors"
            title="Clique para editar"
          >
            <span class="truncate">{{ task.title }}</span>
          </div>
        </div>
        
        <div v-for="(day, index) in 7" :key="index" class="col-span-1 flex justify-center">
          <button 
            @click="$emit('toggle-day', task.id, index)"
            class="w-6 h-6 rounded border transition-all flex items-center justify-center cursor-pointer"
            :class="task.completedDays[index] 
              ? 'bg-teal-600 border-teal-600 text-white' 
              : 'bg-white border-gray-300 hover:border-teal-400'"
          >
            <Check v-if="task.completedDays[index]" class="w-4 h-4" stroke-width="3" />
          </button>
        </div>

        <div class="col-span-1 text-center font-semibold text-gray-600 relative group/edit-points">
          <div v-if="editPointsId === task.id" class="flex items-center justify-center">
            <input 
              ref="pointsInput"
              v-model.number="editPoints"
              type="number"
              class="w-16 px-1 py-1 text-center rounded border border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              @blur="savePoints(task)"
              @keyup.enter="savePoints(task)"
              @keyup.esc="cancelPoints"
            >
          </div>
          <div 
            v-else 
            @click="startEditPoints(task)"
            class="cursor-pointer hover:text-teal-700 py-1 transition-colors"
            title="Clique para editar pontos"
          >
            {{ task.points }}
          </div>
        </div>

        <div class="col-span-1 flex justify-end">
          <button 
            @click="askRemove(task.id)" 
            class="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer"
            title="Excluir tarefa"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="tasks.length === 0" class="px-6 py-8 text-center text-gray-400">
        Nenhuma tarefa cadastrada.
      </div>
    </div>

    <div class="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
      <div class="flex gap-3">
        <input 
          v-model="newName" 
          type="text" 
          placeholder="Nome da nova tarefa"
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
      title="Excluir Tarefa"
      message="Tem certeza que deseja excluir esta tarefa?"
      confirm-text="Excluir"
      cancel-text="Cancelar"
      type="danger"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Check, Trash2 } from 'lucide-vue-next'
import type { Task } from '@/types'
import type { PropType } from 'vue'
import { usePladimStore } from '@/stores/pladim'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

defineProps({
  tasks: {
    type: Array as PropType<Task[]>,
    required: true
  }
})

const emit = defineEmits(['add', 'remove', 'toggle-day'])
const store = usePladimStore()

const newName = ref('')
const newPoints = ref<number | ''>('')
const confirmRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
const removeId = ref<string | null>(null)

// Edição de Nome
const editId = ref<string | null>(null)
const editName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

const startEdit = (task: Task) => {
  editId.value = task.id
  editName.value = task.title
  nextTick(() => {
    const el = Array.isArray(nameInput.value) ? nameInput.value[0] : nameInput.value
    el?.focus()
  })
}

const saveName = (task: Task) => {
  if (editId.value === task.id && editName.value.trim()) {
    store.updateTask(task.id, { title: editName.value })
    editId.value = null
  }
}

const cancelEdit = () => editId.value = null

// Edição de Pontos
const editPointsId = ref<string | null>(null)
const editPoints = ref<number | ''>('')
const pointsInput = ref<HTMLInputElement | null>(null)

const startEditPoints = (task: Task) => {
  editPointsId.value = task.id
  editPoints.value = task.points
  nextTick(() => {
    const el = Array.isArray(pointsInput.value) ? pointsInput.value[0] : pointsInput.value
    el?.focus()
  })
}

const savePoints = (task: Task) => {
  if (editPointsId.value === task.id && editPoints.value !== '') {
    store.updateTask(task.id, { points: Number(editPoints.value) })
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
