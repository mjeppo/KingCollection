<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'

// Definitie van de Props (data die van de ouder-component komt)
const { isVisible, book } = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  book: {
    type: Object, // Verwacht een boek-object
    default: null,
  },
})

const router = useRouter()

// Definitie van de Events (om de modal te sluiten)
const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
}

const navigateToEditBook = () => {
  router.push(`/boek-aanpassen/${book.id}`)
}

// console.log(props, emit)
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="closeModal()">
        <i class="fa-solid fa-circle-xmark fa-xl" style="color: var(--blood-primary)"></i>
      </button>

      <div v-if="book">
        <h2>{{ book.titel }}</h2>
        <p>Auteur(s): {{ book.auteur }}</p>
        <p>Eerste uitgave: {{ book.jaar_van_uitgave }}</p>
        <p v-if="book.serie">Serie / verhalen: {{ book.serie }}</p>
        <p>Taal : {{ book.taal }}</p>
        <p>Originele titel: {{ book.originele_titel }}</p>
        <a
          :href="book.cover_url"
          target="_blank"
          v-if="book.cover_url"
          title="Bekijk afbeelding via url"
        >
          <img
            :src="book.cover_url"
            :alt="book.titel"
            class="modal-cover"
            @error="
              (e) => (e.target.src = 'https://placehold.jp/200x300.png?text=Fout+bij+laden')
            "
          />
        </a>
        <div>
          <button
            class="btn btn-primary bg-(--blood-primary)! border-0"
            @click="navigateToEditBook"
          >
            Aanpassen
          </button>
        </div>
      </div>
      <div v-else>
        <p>Geen boekdetails beschikbaar.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Donkere, transparante achtergrond */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Zorg dat het boven alles ligt */
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
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  /* Styling om de knop duidelijk te maken */
}
.modal-cover {
  max-width: 200px; /* Kleinere cover in modal */
  height: auto;
  padding-bottom: 10px;
}
</style>
