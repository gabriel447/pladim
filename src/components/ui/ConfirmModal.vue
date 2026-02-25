<!--
  Componente de modal de confirmação. Utilizado para confirmar ações destrutivas (como excluir tarefas/recompensas).
-->
<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div class="p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-2">{{ title }}</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button 
            type="button" 
            :class="[
              'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white transition-colors sm:ml-3 sm:w-auto sm:text-sm cursor-pointer focus:outline-none',
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 focus:bg-red-800' 
                : 'bg-teal-600 hover:bg-teal-700 focus:bg-teal-800'
            ]"
            @click="confirm"
          >
            {{ confirmText }}
          </button>
          <button 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:border-gray-400 transition-colors sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
            @click="cancel"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Confirmar ação'
  },
  message: {
    type: String,
    default: 'Tem certeza que deseja continuar?'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'danger'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const confirm = () => {
  emit('confirm')
  close()
}

const cancel = () => {
  emit('cancel')
  close()
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>