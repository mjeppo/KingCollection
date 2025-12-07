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
  <header class="titel-container flex flex-col items-center p-2 text-white">

    <div class="flex justify-center items-center w-full">

        <router-link to="/" class="text-2xl font-bold">
          <div id="titel-div"><img src="/title.png" alt="" class="w-[650px] titel-img" /></div>
        </router-link>

        <div class="ml-4">

            <button v-if="!isAuthenticated" @click="openLoginModal" class="px-3 py-1">
                 <img src="/king.jpg" alt="logo" width="40" />
            </button>

            <div v-else class="px-3 py-1 cursor-default">
                 <img src="/king.jpg" alt="logo" width="40" />
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

<style>




@media (max-width: 600px) {
  .titel-img {
    width: 300px;
  }
}
</style>
