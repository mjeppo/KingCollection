<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm science-gothic">
      <img src="/public/pennywise.gif">
      <h2 class="text-2xl font-bold mb-4">Beheerder Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
        </div>

        <div class="mb-5">
          <label for="password" class="block text-sm font-medium text-gray-700">Wachtwoord</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
        </div>

        <p v-if="loginError" class="text-sm text-red-600 mb-4">{{ loginError }}</p>

        <button
          type="submit"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium  btn btn-primary hover:bg-green-700"
        >
          Inloggen
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import useAuth from '@/composables/useAuth'; // Importeer je centrale auth logica
import { useToast } from 'vue-toastification';

const toast = useToast()

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  isVisible: Boolean
});

const emit = defineEmits(['close']);

const { signIn } = useAuth(); // Haal de inlogfunctie op
const email = ref('');
const password = ref('');
const loginError = ref('');

const handleLogin = async () => {
  loginError.value = ''; // Reset foutmelding

  const { error } = await signIn(email.value, password.value);

  if (error) {
    // Toon de foutmelding als de login mislukt
    loginError.value = error.message || 'Onbekende fout bij inloggen.';
    toast.error('Onbekende fout bij inloggen.' + loginError.value)
  } else {
    emit('close');
    toast.success("Je bent succesvol ingelogd! Welkom!")
    email.value = '';
    password.value = '';
  }
};
</script>

<style scoped>
/* Gebruik de modal styling van je BookDetailModal, of voeg deze toe */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); display: flex;
  justify-content: center; align-items: center; z-index: 2000;
}

.science-gothic {
  font-family: 'Science Gothic';
}
</style>
