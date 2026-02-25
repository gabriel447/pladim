<!--
  Tela de Login/Inicial. Gerencia a autenticação do usuário via Google.
-->
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white p-12 rounded-2xl shadow-lg max-w-md w-full text-center mx-4">
      <h1 class="text-4xl font-bold mb-3 text-[#1a202c] tracking-tight">Pladim.</h1>
      <p class="text-gray-500 mb-10 text-lg font-normal">
        Planejador de Tarefas Gamificado.
      </p>
      <div class="flex justify-center w-full">
        <button 
          @click="login"
          :disabled="isLoading"
          class="flex items-center justify-center gap-3 w-full py-3 px-6 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors duration-200 ease-in-out group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-600 font-medium">Autenticando...</span>
          </div>
          <div v-else class="flex items-center gap-3">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-2.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-gray-700 font-medium text-lg">Entrar com Google</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePladimStore } from '@/stores/pladim'
import { googleTokenLogin, googleAuthCodeLogin } from 'vue3-google-login'
import { ref } from 'vue'
import { useToast } from '@/components/ui/ToastContainer.vue'

const router = useRouter()
const store = usePladimStore()
const isLoading = ref(false)
const { add: addToast } = useToast()

const login = () => {
  isLoading.value = true
  
  googleTokenLogin().then((response: any) => {
    if (response.access_token) {
      fetchUserInfo(response.access_token)
    } else if (response.code) {
      exchangeCodeForToken(response.code)
    } else {
      tryAuthCodeFlow()
    }
  }).catch((error) => {
    console.error('Erro no login implícito:', error)
    tryAuthCodeFlow()
  })
}

const tryAuthCodeFlow = () => {
  googleAuthCodeLogin().then((response) => {
    if (response.code) {
      exchangeCodeForToken(response.code)
    } else {
      throw new Error('Não foi possível obter o código de autorização.')
    }
  }).catch((error) => {
    console.error('Erro no login (Code Flow):', error)
    isLoading.value = false
    addToast({
      title: 'Erro de Autenticação',
      message: 'Não foi possível autenticar com o Google.',
      type: 'error'
    })
  })
}

const exchangeCodeForToken = async (code: string) => {
  try {
    const params = new URLSearchParams()
    params.append('code', code)
    params.append('client_id', import.meta.env.VITE_GOOGLE_CLIENT_ID)
    params.append('client_secret', import.meta.env.VITE_GOOGLE_CLIENT_SECRET)
    params.append('redirect_uri', 'postmessage')
    params.append('grant_type', 'authorization_code')

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const data = await res.json()

    if (data.access_token) {
      fetchUserInfo(data.access_token)
    } else {
      throw new Error('Falha na troca do token.')
    }
  } catch (error) {
    console.error('Erro na troca do token:', error)
    isLoading.value = false
    alert('Erro ao processar o login.')
  }
}

const fetchUserInfo = async (token: string) => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const user = await res.json()
    
    if (user.error) {
      throw new Error(user.error.message || 'Erro ao buscar dados do usuário')
    }

    store.setUser({
      email: user.email,
      name: user.name,
      avatar: user.picture,
      googleId: user.id
    })
    
    router.push('/dashboard')
  } catch (error) {
    console.error('Erro ao buscar info do usuário:', error)
    alert('Erro ao obter dados do perfil.')
    isLoading.value = false
  }
}
</script>
