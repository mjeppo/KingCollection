<script setup>
import {  defineEmits } from 'vue'

const { isVisible, boekTitel, boekAuteur } = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  // Dit is de prop die de titel ontvangt uit EditBookView.vue
  boekTitel: {
    type: String,
    default: 'dit boek',
  },
  boekAuteur: {
    type: String,
    default: 'Stephen King',
  },
})

const emit = defineEmits(['close', 'confirm-delete'])

function confirmDelete() {
  emit('confirm-delete')
}

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content bg-white p-6 rounded-lg shadow-2xl w-11/12 max-w-sm science-gothic text-center">
      <div class="mb-3">Weet je zeker dat je het boek<h3>{{ boekTitel }}</h3>van<h4>{{ boekAuteur }}</h4> wilt verwijderen?</div>
      <button @click="confirmDelete" class="btn btn-danger mb-2">Verwijderen</button>
      <button @click="close" class="btn btn-primary">Annuleren</button>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.science-gothic {
  font-family: 'Science Gothic';
}

.modal-content {
  font-family: 'Science Gothic';
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  position: relative;
  max-height: 100vh;
  overflow-y: auto;
}
</style>
