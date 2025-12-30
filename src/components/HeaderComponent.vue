<script setup>
// HeaderComponent.vue <script setup>

import { ref } from 'vue'
import useAuth from '@/composables/useAuth' // 1. Importeer de auth composable
import LoginModal from './LoginModal.vue' // 2. Importeer de LoginModal (aanname: staat in dezelfde
// map of correct pad)
import { useRouter } from 'vue-router'

// Gebruik de Auth Composable
const { user, isAuthenticated, signOut } = useAuth()

// Status van de Login Modal
const isLoginModalVisible = ref(false)

// Functies voor de Modal
const openLoginModal = () => {
  isLoginModalVisible.value = true
}

const closeLoginModal = () => {
  isLoginModalVisible.value = false
}

const router = useRouter()

// Functie voor de Toevoegen knop (stuurt de gebruiker naar de AddBookView)
const navigateToAddBook = () => {
  router.push('/boek-toevoegen')
}
</script>

<template>
  <header class="titel-container flex flex-col items-center bg-[#fffce9] text-white">
    <img src="/public/pennywise_bg2.png" class=" penny-wise-header">

    <nav class="my-3">
      <router-link to="/" class="nav-btn" active-class="active">
        <i class="fas fa-list text-black"></i> Lijst
      </router-link>
      <router-link to="/gallery" class="nav-btn" active-class="active">
        <i class="fas fa-th"></i> Raster
      </router-link>
    </nav>

    <div class="flex justify-center items-center w-full">
      <router-link to="/" class="text-2xl font-bold">
        <div id="titel-div">
          <img src="/title.png" alt="" class="w-160 " id="titel-img" />
        </div>
      </router-link>

      <div class="ml-4">
        <button v-if="!isAuthenticated" @click="openLoginModal" class="px-3 py-1 titel-img">
          <img src="/favicon1.png" alt="logo" width="40" />
        </button>

        <div v-else class="px-3 py-1 cursor-default titel-img">
          <img src="/favicon1.png" alt="logo" width="40" />
        </div>
      </div>
    </div>

    <div v-if="isAuthenticated" class="auth-controls mt-2 flex flex-col items-center space-y-1">
      <div class="flex space-x-3">
        <button
          @click="navigateToAddBook"
          class="px-3 mr-1! py-1 bg-blue-600 hover:bg-blue-700 rounded-md science-gothic"
        >
          <i class="fa-solid fa-plus"></i>
        </button>

        <button
          @click="signOut"
          class="px-3 py-1 bg-(--blood-primary) hover:bg-red-600 rounded-md science-gothic"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      <span class="text-xs text-gray-400 science-gothic"> Welkom, {{ user.email }} </span>
    </div>
  </header>
  <LoginModal :isVisible="isLoginModalVisible" @close="closeLoginModal" />
</template>

<style scoped>
.titel-img {
  filter: drop-shadow(0 4px 5px var(--blood-glow));
  border-radius: 5px;
}

@media (max-width: 600px) {
  .titel-img {
    width: 300px;
  }
}

.nav-btn {
  padding: 8px 15px;
  margin: 0 5px;
  text-decoration: none;
  color: #ccc;
  border-radius: 5px;
}
.active {
  background-color: var(--blood-primary); /* King-rood */
  color: white;
}
</style>
