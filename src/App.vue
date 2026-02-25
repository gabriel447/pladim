<!--
  Componente raiz da aplicação. Estrutura básica e container para as notificações (Toasts).
-->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <RouterView />
  <ToastContainer />
</template>
