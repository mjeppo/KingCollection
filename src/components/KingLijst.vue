<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BookDetailModal from './BookDetailModal.vue'
import useAuth from '@/composables/useAuth' // <-- Nieuwe import
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'
import { useToast } from 'vue-toastification'
import pb from '@/lib/pocketbase'
import { onActivated } from 'vue'

const route = useRoute()

const toast = useToast()

const boeken = ref([]) // Houdt de opgehaalde data vast

/* //^ Oude ophaal functie voor Supabase

// async function fetchBoeken() {
//   // Gebruik .from() om je tabel te selecteren
//   // Gebruik .select() om de gewenste kolommen op te halen
//   const { data, error } = await supabase
//     .from('boeken') // <-- Gebruik hier de naam van je tabel
//     .select('*') // Haal alle kolommen op
//     .order('titel', { ascending: true }) // Sorteer optioneel

//   if (error) {
//     console.error('Fout bij het ophalen van boeken:', error)
//   } else {
//     boeken.value = data
//     // Nu kun je je filtering/sortering (filteredAndSortedBooks) hierop baseren
//   }
// }
*/

// * Nieuwe ophaal functie voor pocketbase
async function fetchBoeken() {
  try {
    // In PocketBase gebruik je .collection() in plaats van .from()
    // getFullList() haalt direct alle records op (zonder ingewikkelde selecties)
    const records = await pb.collection('boeken').getFullList({
      sort: '+titel', // Sorteer op titel (oplopend)
    })

    boeken.value = records
    console.log('Boeken succesvol opgehaald:', records)
  } catch (error) {
    // PocketBase gooit een error (exception) als er iets misgaat
    console.error('Fout bij het ophalen van boeken:', error.message)
  }
}

onMounted(() => {
  fetchBoeken()
})

onActivated(async () => {
  console.log("Grid geactiveerd, data verversen...");

  // Sluit eventuele openstaande modals (van een vorige sessie)
  if (typeof isModalVisible.value !== 'undefined') {
    isModalVisible.value = false;
  }

  // Haal de nieuwste lijst op van PocketBase
  await fetchBoeken();
});

watch(
  () => route.name, // Kijk of de naam van de route verandert
  (newPath) => {
    // Controleer of de nieuwe route de route is van de boekenlijst (KingLijst.vue)
    // Je moet hier de 'name' van je boekenlijst route uit router/index.js gebruiken
    if (newPath === '/') {
      // Vervang 'home' met de werkelijke naam van je lijst-route
      fetchBoeken()
    }
  },
)

const searchTerm = ref('')

const filteredAndSortedBooks = computed(() => {
  console.log('Wat zit er in boeken.value?', boeken.value)
  // Gebruik de boeken.value die gevuld wordt door Supabase
  const rawList = boeken.value || [] // Zorg voor een lege array als 'boeken' nog niet geladen is

  // Eerst de lijst filteren.
  const filteredList = rawList.filter((book) => {
    // Zet beide naar kleine letters voor case-insensitive zoeken
    const title = (book.titel || '').toLowerCase()
    const search = (searchTerm.value || '').toLowerCase()

    // Controleer of de titel de zoekterm bevat
    return title.includes(search)
  })

  // Vervolgens sorteren
  // 2. Sorteren (Alfabetisch, ongeacht hoofdletters)
  // We maken een kopie met [...array] omdat .sort() de originele array aanpast
  return [...filteredList].sort((a, b) => {
    const titelA = (a.titel || '').toLowerCase()
    const titelB = (b.titel || '').toLowerCase()

    // localeCompare is de netste manier om tekst te vergelijken
    return titelA.localeCompare(titelB, 'nl', { sensitivity: 'base' })
  })
})

// OP FALSE ZETTEN
const isModalVisible = ref(false)

// OP NULL ZETTEN
const selectedBook = ref(null)

function showDetails(book) {
  selectedBook.value = book
  isModalVisible.value = true
  console.log(book)
}

// Functie om de modal te sluiten
function hideDetails() {
  isModalVisible.value = false
  selectedBook.value = null // Opschonen na sluiten
}

const aantal = computed(() => filteredAndSortedBooks.value.length)

const { isAuthenticated } = useAuth()

const bookIdToDelete = ref(null)
const bookTitleToDelete = ref('')
const bookAuteurToDelete = ref('')

const isVerwijderen = ref(false) // <-- Nieuw: Status voor verwijderen
const isConfirmModalVisible = ref(false)

function askForDeleteConfirmation(book) {
  bookIdToDelete.value = book.id // Bewaar de ID
  bookTitleToDelete.value = book.titel // Bewaar de Titel
  bookAuteurToDelete.value = book.auteur
  isConfirmModalVisible.value = true
}

async function executeDelete() {
  isConfirmModalVisible.value = false // Sluit de modal

  if (!isAuthenticated.value || !bookIdToDelete.value) {
    return
  }

  isVerwijderen.value = true

  // * Nieuwe pocketbase functie
  try {
    // In PocketBase is dit één simpele aanroep
    await pb.collection('boeken').delete(bookIdToDelete.value)

    // Na succes:
    fetchBoeken() // Herlaad je lijst
    toast.success(`Boek "${bookTitleToDelete.value}" succesvol verwijderd.`)
    bookIdToDelete.value = null
    bookTitleToDelete.value = ''
  } catch (error) {
    console.error('Verwijderfout:', error)
    toast.error('Er ging iets mis bij het verwijderen van {{ book.title }}, probeer het opnieuw.')
  } finally {
    isVerwijderen.value = false
  }

  /*// ^ Oude supabase functie
  ... (Hier gebruik je nu de opgeslagen ID) ...
  const { error } = await supabase.from('boeken').delete().eq('id', bookIdToDelete.value) // Gebruik de opgeslagen ID!

  isVerwijderen.value = false
  if (error) {
    toast.error(
      'Er ging iets mis bij het verwijderen van "{{ book.title }}", probeer het opnieuw',
      error,
    )
  } else {
    // Na succes:
    // 1. Herlaad de lijst om het verwijderde boek te laten verdwijnen
    fetchBoeken()
    // 2. Ruim de opgeslagen ID op
    bookIdToDelete.value = null
    bookTitleToDelete.value = ''
    toast.success(`Boek "{{ book.title }}" succesvol verwijderd.`)
  }
    */
}
</script>

<template>
  <div class="boekenlijst-container bg-(#fffce9)">
    
    <div class="boekenlijst-titel-container">
      <div class="boekenlijst--titel">Boekenlijst</div>
      <div class="aantal-boeken pr-7">Aantal boeken: {{ aantal }}</div>
    </div>
    <div class="zoekveld-element" id="input-search-element">
      <label for="zoekveld" class="horror">Zoek boek</label>
      <input
        type="text"
        class="zoekveld focus:bg-(--blood-primary) focus:text-white mr-2!"
        id="zoekveld"
        v-model="searchTerm"
      />
      <button
        class="knop-zoeken btn btn-danger shadow-2xl shadow-red-800"
        id="knop-zoeken"
        @click="searchTerm = ''"
      >
        WIS
      </button>
    </div>
    <div
      :key="boekIdx"
      v-for="(book, boekIdx) in filteredAndSortedBooks"
      class="boekenlijst science-gothic"
    >
      <span class="boekenlijst-nummer">{{
        boekIdx + 1 < 10 ? '0' + (boekIdx + 1) : boekIdx + 1
      }}</span>
      <div class="boekenlijst-titel" @click="showDetails(book)">{{ book.titel }}</div>
      <span class="boekenlijst-auteur">{{ book.auteur }} - {{ book.jaar_van_uitgave }}</span>
      <div v-if="isAuthenticated" class="flex items-center space-x-2">
        <router-link :to="{ name: 'edit-book', params: { id: book.id } }" title="Boek aanpassen">
          <i class="fa-regular fa-pen-to-square text-blue-600 ml-4"></i>
        </router-link>

        <button
          @click.prevent="askForDeleteConfirmation(book)"
          title="Boek verwijderen"
          class="text-red-700 hover:text-red-900"
          :disabled="isVerwijderen"
        >
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  </div>
  <BookDetailModal :isVisible="isModalVisible" :book="selectedBook" @close="hideDetails" />



  <DeleteConfirmModal
    :isVisible="isConfirmModalVisible"
    :boekTitel="bookTitleToDelete"
    :boekAuteur="bookAuteurToDelete"
    @close="isConfirmModalVisible = false"
    @confirm-delete="executeDelete"
  />

  <!--
:boekTitel="${book.titel}"
    :boekAuteur="book.auteur"
    -->
</template>

<style>
.boekenlijst-container {
  max-width: 700px;
  margin: 0px auto;
}

.zoekveld-element {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: left;
}

.zoekveld {
  padding: 5px;
  margin-left: 20px;
  border: 2px var(--blood-primary) solid;
  border-radius: 5px;
  width: 75%;
}

.boekenlijst-titel-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: horror;
  font-size: 24px;
  border-bottom: 1px solid var(--blood-primary);
  margin: 0 0 1rem 0;
}

.boekenlijst {
  display: flex;
  align-items: center;
  justify-content: left;
}

.boekenlijst-nummer {
  padding: 0 0.5rem 0 0;
  font-family: Roboto, sans-serif;
  color: var(--blood-primary);
  font-size: 12px;
}

.boekenlijst-titel {
  text-transform: uppercase;
  padding: 0.1rem 0.5rem;
  font-size: 16px;
  /* border: 1px solid black; */
  border-radius: 5px;
  margin: 0.4rem;
  width: fit-content;
  cursor: pointer;
  box-shadow: 1px 1px 3px var(--blood-primary);
  transition: all 0.1s ease;
}

.boekenlijst-titel:hover {
  background-color: var(--blood-primary);
  color: var(--color-lighttheme-light);
  box-shadow: 0px 0px 5px var(--blood-primary);
}

.boekenlijst-titel:active {
  box-shadow: 0 0 0 #0056b3;
  transform: translateY(3px);
}

.boekenlijst-auteur {
  font-size: 12px;
}

.boekenlijst:focus {
  transform: translate(x);
}

@media (max-width: 500px) {
  .boekenlijst-titel {
    font-size: 12px;
  }

  .boekenlijst-auteur {
    display: none;
  }
}
</style>
