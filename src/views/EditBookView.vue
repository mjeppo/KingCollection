<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { ref, computed, onMounted } from 'vue' // <-- onMounted toegevoegd
import { supabase } from '@/supabase'
import { useRoute, useRouter } from 'vue-router' // <-- useRoute toegevoegd
import useAuth from '@/composables/useAuth'
import { useToast } from 'vue-toastification'
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue'

const route = useRoute() // <-- Nieuw: Om ID op te halen
const router = useRouter()
const { isAuthenticated } = useAuth()

// --- Edit Specifieke State ---
const boekId = route.params.id // Haal de ID van het boek op uit de URL
const boekGegevens = ref(null) // Hierin slaan we de geladen data op
const laadFout = ref(null)

// --- Formuliervelden (Refs) ---
const titelInput = ref('')
const auteurInput = ref('')
const serieInput = ref('')
const jaarInput = ref('')
const origineleTitelInput = ref('')
const taalInput = ref('Nederlands')
const coverUrlInput = ref('')

const toast = useToast()

// --- Status en Fouten ---
const saveError = ref(null)
const isSaving = ref(false)
const isVerwijderen = ref(false) // <-- Nieuw: Status voor verwijderen
const isConfirmModalVisible = ref(false);

// De standaard URL die gebruikt wordt als het inputveld leeg is
const DEFAULT_IMAGE_URL =
  'https://www.readshop.nl/images/active/carrousel/fullsize/9789021026381_front.jpg'

// De Computed Property: (Blijft hetzelfde, maar nu voor de update)
const urlRegex = /^(http|https):\/\/[^ "]+$/
const finalCoverUrl = computed(() => {
  const input = coverUrlInput.value.trim()



  if (input.length === 0) {
    return { isValid: true, url: DEFAULT_IMAGE_URL, message: 'Standaard cover geladen.' }
  }
  if (urlRegex.test(input)) {
    return { isValid: true, url: input, message: 'Cover voorbeeld geladen.' }
  }
  return { isValid: false, url: DEFAULT_IMAGE_URL, message: '❌ Voer een geldige URL in...' }
})

let zoekUrl = 'http://www.google.nl/search?tbm=isch&q='
let zoekTerm = 'Stephen+King'

// ----------------------------------------------------------------------
// NIEUWE FUNCTIE: Data Ophalen
// ----------------------------------------------------------------------
async function fetchBoekVoorBewerking() {
  laadFout.value = null

  if (!isAuthenticated.value) {
    toast.error("Je moet ingelogd zijn om te bewerken.")
    router.push('/')
    return
  }

  // We gebruiken .single() omdat we slechts één boek verwachten
  const { data, error } = await supabase.from('boeken').select('*').eq('id', boekId).single()

  if (error) {
    laadFout.value = 'Kan boek niet laden: ' + error.message
    return
  }

  if (data) {
    boekGegevens.value = data
    // Vul de refs met de opgehaalde data
    titelInput.value = data.titel || ''
    auteurInput.value = data.auteur || ''
    serieInput.value = data.serie || ''
    // Zorg dat jaarInput een string is voor de input field
    jaarInput.value = data.jaar_van_uitgave ? String(data.jaar_van_uitgave) : ''
    origineleTitelInput.value = data.originele_titel || ''
    taalInput.value = data.taal || 'Nederlands'
    // Gebruik de correcte kolomnaam die je hebt gecontroleerd
    coverUrlInput.value = data.cover_url || ''
    zoekTerm = data.auteur + '+' + data.titel
  } else {
    laadFout.value = 'Boek niet gevonden.'
  }
}

// Haal data op zodra de component laadt
onMounted(fetchBoekVoorBewerking)

// ----------------------------------------------------------------------
// AANGEPASTE FUNCTIE: Update (Opslaan)
// ----------------------------------------------------------------------
async function handleUpdate() {
  // Naam veranderd van handleSubmit naar handleUpdate
  // Validatie
  if (!isAuthenticated.value) {
    saveError.value = 'U moet ingelogd zijn om wijzigingen op te slaan.'
    return
  }
  // ... (Andere validaties: titel, auteur, jaar, etc. zijn verplicht)
  const jaar = parseInt(jaarInput.value)
  if (isNaN(jaar)) {
    saveError.value = 'Jaar van uitgave moet een geldig nummer zijn.'
    return
  }

  isSaving.value = true
  saveError.value = null

  const bijgewerkteGegevens = {
    titel: titelInput.value,
    auteur: auteurInput.value,
    serie: serieInput.value || null,
    jaar_van_uitgave: jaar,
    originele_titel: origineleTitelInput.value,
    taal: taalInput.value,
    cover_url: finalCoverUrl.value.url, // Gebruik de correcte kolomnaam
  }

  // UPDATE in plaats van INSERT en gebruik .eq('id', boekId)
  const { error } = await supabase
    .from('boeken')
    .update(bijgewerkteGegevens)
    .eq('id', boekId) // CRUCIAAL: Update alleen dit specifieke boek
    .select()

  isSaving.value = false

  if (error) {
    console.error('Fout bij het opslaan van de wijzigingen:', error)
    saveError.value = 'Fout bij opslaan: ' + (error.message || 'Controleer de velden.')
  } else {
    toast.success("Boek succesvol bijgewerkt! 🎉");
    router.push('/')
  }
}

function zoekCover() {
  let query = zoekTerm.replace(' ', '+')
  let url = zoekUrl + query

  console.log(query, url)
  window.open(url, '_blank')
}

// Functie om de modal te tonen
function askForDeleteConfirmation() {
    if (!isVerwijderen.value) {
        isConfirmModalVisible.value = true;
    }
}

async function executeDelete() {
    // Sluit eerst de modal als hij nog open is
    isConfirmModalVisible.value = false;

    if (!isAuthenticated.value) return;

    isVerwijderen.value = true;
    saveError.value = null;

    const { error } = await supabase
        .from('boeken')
        .delete()
        .eq('id', boekId); // Verwijder de rij met deze ID

    isVerwijderen.value = false;

    if (error) {
        saveError.value = 'Fout bij het verwijderen van het boek: ' + error.message;
        console.error(error);
        // Gebruik eventueel je toast hier: toast.error('Verwijdering mislukt...');
    } else {
        // Gebruik eventueel je toast hier: toast.success('Boek verwijderd!');
        alert('Boek succesvol verwijderd.');
        router.push('/');
    }
}

</script>

<template>
  <HeaderComponent />
  <div class="boek-toevoegen-container w-full mx-auto font-['Science Gothic']">
    <div v-if="laadFout" class="p-6 text-red-600">
      <h2 class="text-3xl font-[Horror]">Fout</h2>
      <p>{{ laadFout }}</p>
    </div>
    <div v-else-if="!boekGegevens" class="p-6">
      <h2 class="text-3xl font-[Horror]">Laden...</h2>
      <p>Boekgegevens worden geladen...</p>
    </div>

    <form v-else @submit.prevent="handleUpdate" class="max-w-2xl mx-auto">
      <div>
        <div class="flex justify-between items-center">
          <h2 class="text-3xl my-1 font-[Horror]">Boek bewerken</h2>

          <button class="btn btn-success p-1 text-sm! h-8" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Bezig met Opslaan...' : 'Wijzigingen Opslaan' }}
          </button>
        </div>

        <p v-if="saveError" class="text-sm text-red-600 my-2">{{ saveError }}</p>

        <div class="flex mb-2">
          <label for="boek-titel" class="mr-2 w-[250px]">Titel :</label>
          <input
            type="text"
            id="boek-titel"
            class="boek--input w-[500px] p-1"
            placeholder="De Donkere Toren"
            v-model="titelInput"
          />
        </div>

        <div class="flex mb-2">
          <label for="boek-auteur" class="mr-2 w-[250px]">Auteur(s) :</label>
          <input
            type="text"
            id="boek-auteur"
            class="boek--input w-[500px] p-1"
            placeholder="Stephen King"
            v-model="auteurInput"
          />
        </div>

        <div v-if="serieInput" class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-serie" class="col-span-3">Serie / delen:</label>
          <textarea
            id="boek-serie"
            class="p-1 col-span-7 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Serie / Delen"
            v-model="serieInput"
          >
          </textarea>
        </div>
        <div v-else class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-serie" class="col-span-3">Serie / delen:</label>
          <input
            type="text"
            id="boek-serie"
            class="p-1 col-span-7 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Serie / Delen"
            v-model="serieInput"
          />
        </div>

        <div class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-jaar" class="col-span-3">Jaar van uitgave :</label>
          <input
            type="text"
            id="boek-jaar"
            class="p-1 col-span-7 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Jaar"
            v-model="jaarInput"
          />
        </div>

        <div class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-originele-titel" class="col-span-3">Originele titel :</label>
          <input
            type="text"
            id="boek-originele-titel"
            class="p-1 col-span-7 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Originele titel"
            v-model="origineleTitelInput"
          />
        </div>
        <div class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-taal" class="col-span-3">Taal :</label>
          <input
            type="text"
            id="boek-taal"
            class="p-1 col-span-7 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Taal"
            v-model="taalInput"
          />
        </div>

        <div class="grid grid-cols-10 gap-1 items-start mb-1">
          <label for="boek-cover-url" class="col-span-3">Cover :</label>
          <textarea
            type="text"
            id="boek-cover-url"
            class="p-1 col-span-6 resize-y rounded border-2 border-(--blood-primary) text-sm!"
            placeholder="Url boekomslag"
            v-model="coverUrlInput"
          />
          <div class="col-span-1 mx-auto my-auto text-2xl">
            <img
              src="/google.png"
              class="w-7 cursor-pointer"
              alt=""
              @click="zoekCover"
              title="Zoek op Google naar boekomslag"
            />
          </div>
        </div>

        <div class="text-xl">
          <label for="boek-voorbeeld-cover" class="mr-2 w-[250px]">Voorbeeld cover :</label>
          <div class="p-1">
            <img
              :src="finalCoverUrl?.url"
              alt="voorbeeld van cover"
              id="boek-voorbeeld-cover"
              class="w-[250px] border-2 border-(--blood-primary)! rounded p-1"
            />
            <p v-if="finalCoverUrl && !finalCoverUrl.isValid" class="text-sm text-red-600 mt-1">
              {{ finalCoverUrl.message }}
            </p>
          </div>
        </div>

        <div class="mt-6 border-t pt-4 flex justify-end">
          <button
            type="button"
            @click="askForDeleteConfirmation"
            :disabled="isVerwijderen"
            class="bg-red-700 text-white p-2 rounded hover:bg-red-800 disabled:bg-gray-400"
          >
            {{ isVerwijderen ? 'Bezig met Verwijderen...' : 'Boek Verwijderen' }}
          </button>
        </div>
      </div>
    </form>
  </div>

  <DeleteConfirmModal
    :isVisible="isConfirmModalVisible"
    :boekTitel="titelInput"
    :boekAuteur="auteurInput"
    @close="isConfirmModalVisible = false"
    @confirm-delete="executeDelete"
/>
</template>

<style>
.boek--input {
  border: 2px solid var(--blood-primary);
  border-radius: 5px;
  /* width: 600px; */
}

.boek-toevoegen-container {
  font-family: 'Science Gothic';
}
</style>
