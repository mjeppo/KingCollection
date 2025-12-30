<script setup>
import HeaderComponent from '@/components/HeaderComponent.vue'
import { ref, computed } from 'vue'
import pb from '@/lib/pocketbase'
import { useRouter } from 'vue-router' // Voor navigatie na opslaan
import useAuth from '@/composables/useAuth' // Optioneel: om de gebruiker te checken
import { useToast } from 'vue-toastification'

const router = useRouter()
const { isAuthenticated } = useAuth() // Optioneel: om de formulierweergave te conditioneren

const titelInput = ref('')
const auteurInput = ref('')
const serieInput = ref('')
const jaarInput = ref('')
const origineleTitelInput = ref('')
const taalInput = ref('Nederlands') // Standaardwaarde
const saveError = ref(null)
const isSaving = ref(false)
const coverUrlInput = ref('')

const toast = useToast()

// De standaard URL die gebruikt wordt als het inputveld leeg is
const DEFAULT_IMAGE_URL =
  'https://www.readshop.nl/images/active/carrousel/fullsize/9789021026381_front.jpg'

// De Computed Property: Bepaalt welke URL daadwerkelijk gebruikt wordt
const urlRegex = /^(http|https):\/\/[^ "]+$/

// Computed Property die de logica afhandelt
const finalCoverUrl = computed(() => {
  const input = coverUrlInput.value.trim()

  // 1. Invoer is leeg
  if (input.length === 0) {
    return {
      isValid: true,
      url: DEFAULT_IMAGE_URL,
      message: 'Standaard cover geladen.',
    }
  }

  // 2. Invoer is aanwezig en voldoet aan de URL-check
  if (urlRegex.test(input)) {
    return {
      isValid: true,
      url: input,
      message: 'Cover voorbeeld geladen.',
    }
  }

  // 3. Invoer is aanwezig, maar ongeldig
  return {
    isValid: false,
    url: DEFAULT_IMAGE_URL, // Val terug op de standaardafbeelding
    message: '❌ Voer een geldige URL in (moet beginnen met http:// of https://)',
  }
})

let vandaanGekomen = '/'; // Standaard fallback

router.beforeEach((to, from) => {
  if (to.path === '/boek-toevoegen') {
    vandaanGekomen = from.fullPath;
    console.log("Ik kwam hiervandaan:", vandaanGekomen);
  }
});

async function handleSubmit() {
  // 1. Validatie (basis)
  console.log('opslaan...')
  if (!isAuthenticated.value) {
    saveError.value = 'U moet ingelogd zijn om een boek toe te voegen.'
    return
  }
  if (!titelInput.value || !auteurInput.value || !jaarInput.value) {
    saveError.value = 'Titel, Auteur en Jaar van uitgave zijn verplicht.'
    if (!titelInput.value) {
      toast.error('Vul de titel in.')
    } else if (!auteurInput.value) {
      toast.error('Vul de auteur in.')
    } else if (!jaarInput.value) {
      toast.error('Vul het jaar van uitgave in.')
    }
    return
  }

  isSaving.value = true
  saveError.value = null

  // 2. Data opstellen
  const nieuwBoek = {
    titel: titelInput.value,
    auteur: auteurInput.value,
    serie: serieInput.value || null, // Gebruik null voor lege velden (of lege string)
    jaar_van_uitgave: parseInt(jaarInput.value),
    originele_titel: origineleTitelInput.value,
    taal: taalInput.value,
    cover_url: finalCoverUrl.value.url,
  }

  // 3. Schrijf naar de database

  // * Nieuwe pocketbase functie
  try {
    await pb.collection('boeken').create(nieuwBoek)
    toast.success(`Boek "${nieuwBoek.titel}" succesvol toegoevoegd!`)
    router.push(vandaanGekomen);
  } catch (error) {
    toast.error('Fout bij toevoegen boek. Zie console voor foutmelding.')
    console.log('Fout bij opslaan: ', error)
    saveError.value = 'Fout bij opslaan: ' + (error.message || 'Controleer de velden.')
  } finally {
    isSaving.value = false
  }

  /* // ^ Oude supabase functie
  const { error } = await supabase
    .from('boeken') // De naam van je tabel
    .insert([nieuwBoek])
    .select() // Gebruik .select() om te bevestigen dat de rij is ingevoegd

  isSaving.value = false

  // 4. Afhandeling
  if (error) {
    console.error('Fout bij het opslaan van het boek:', error)
    saveError.value = 'Fout bij opslaan: ' + (error.message || 'Controleer of alle velden kloppen.')
    toast.error('Opslag mislukt: ' + error.message, { timeout: 5000 })
  } else {
    toast.success('Boek succesvol toegevoegd! 🎉')
    // Na succesvolle invoer, navigeer terug naar de lijst
    router.push('/')
  }

  */
}
</script>

<template>
  <HeaderComponent />
  <div class="boek-toevoegen-container w-[800px] mx-auto font-['Science Gothic']">
    <form @submit.prevent="handleSubmit" class="max-w-xl mx-auto">
      <div>
        <div class="flex justify-between">
          <h2 class="text-3xl my-1 font-[Horror]">Boek toevoegen</h2>
          <button class="btn btn-info" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Bezig met Opslaan...' : 'Boek Opslaan' }}
          </button>
        </div>
        <div class="text-xl my-2 w-full">
          <label for="boek-titel" class="mr-2 w-[250px]">* Titel :</label>
          <input
            type="text"
            id="boek-titel"
            class="boek--input w-[500px] p-1"
            placeholder="De Donkere Toren"
            v-model="titelInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-auteur" class="mr-2 w-[250px]">* Auteur(s) :</label>
          <input
            type="text"
            id="boek-auteur"
            class="boek--input w-[500px] p-1"
            placeholder="Stephen King"
            v-model="auteurInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-auteur" class="w-[250px] mr-2">* Jaar van uitgave :</label>
          <input
            type="text"
            id="boek-auteur"
            class="boek--input w-[250px]"
            placeholder="2025"
            v-model="jaarInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-serie" class="mr-2 w-[250px]">Serie :</label>
          <input
            type="text"
            id="boek-serie"
            class="boek--input w-[500px] p-1"
            placeholder="De Donkere Toren"
            v-model="serieInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-taal" class="mr-2 w-[250px]">Taal :</label>
          <input
            type="text"
            id="boek-taal"
            class="boek--input w-[500px] p-1"
            placeholder="Nederlands/Engels"
            v-model="taalInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-originele_titel" class="mr-2 w-[250px]">Originele titel :</label>
          <input
            type="text"
            id="boek-originele_titel"
            class="boek--input w-[500px] p-1"
            placeholder="The Dark Tower"
            v-model="origineleTitelInput"
          />
        </div>
        <div class="text-xl my-2">
          <label for="boek-cover" class="mr-2 w-[250px]">Link naar cover :</label>
          <textarea
            type="text"
            id="boek-cover"
            class="boek--input w-[500px] p-1 text-xs!"
            placeholder="https://www.readshop.nl/images/active/carrousel/fullsize/9789021026381_front.jpg"
            v-model="coverUrlInput"
          />
        </div>
        <div class="text-xl">
          <label for="boek-cover" class="mr-2 w-[250px]">Voorbeeld cover :</label>
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
      </div>
    </form>
  </div>
</template>

<style>
.boek--input {
  border: 2px solid var(--blood-primary);
  border-radius: 5px;
  width: 600px;
}

.boek-toevoegen-container {
  font-family: 'Science Gothic';
}
</style>
