<script setup>
import { ref, onMounted, computed } from 'vue';
import pb from '@/lib/pocketbase';
import BookDetailModal from '@/components/BookDetailModal.vue'; // Pas het pad aan indien nodig
import HeaderComponent from '@/components/HeaderComponent.vue';
import { onActivated } from 'vue';

const boeken = ref([]);
const searchTerm = ref('');
const selectedBook = ref(null);
const isModalVisible = ref(false);

const fetchBoeken = async () => {
  const records = await pb.collection('boeken').getFullList({
    sort: 'titel',
  });
  boeken.value = records;
};

onMounted(fetchBoeken);

onActivated(async () => {
  console.log("Grid geactiveerd, data verversen...");

  // Sluit eventuele openstaande modals (van een vorige sessie)
  if (typeof isModalVisible.value !== 'undefined') {
    isModalVisible.value = false;
  }

  // Haal de nieuwste lijst op van PocketBase
  await fetchBoeken();
});

// Zoeken en Sorteren
const filteredBooks = computed(() => {
  const rawList = boeken.value || [];
  return rawList
    .filter(b => (b.titel || '').toLowerCase().includes(searchTerm.value.toLowerCase()))
    .sort((a, b) => (a.titel || '').localeCompare((b.titel || ''), 'nl', { sensitivity: 'base' }));
});

// Modal openen
const openDetail = (book) => {
  selectedBook.value = book;
  isModalVisible.value = true;
};
</script>

<template>
  <header-component />
  <div class="gallery-container">
    <div class="search-section">
      <input v-model="searchTerm" placeholder="Zoek op titel..." class="search-input" />
    </div>

    <div class="cover-grid">
      <div v-for="book in filteredBooks" :key="book.id" class="book-card" @click="openDetail(book)">
        <div class="image-wrapper">
          <img
            :src="book.cover_url || 'https://placehold.jp/200x300.png?text=Geen+Cover'"
            :alt="book.titel"
            loading="lazy"
          />
        </div>
        <div class="book-info">
          <p class="book-title">{{ book.titel }}</p>
          <p class="book-year">{{ book.jaar_van_uitgave }}</p>
        </div>
      </div>
    </div>

    <BookDetailModal
      v-if="isModalVisible"
      :book="selectedBook"
      :is-visible="isModalVisible"
      @close="isModalVisible = false"
    />
  </div>
</template>

<style scoped>
.gallery-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  border: 1px solid #444;
  background: #222;
  color: white;
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 25px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
}

.image-wrapper {
  aspect-ratio: 2 / 3;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  background: #1a1a1a;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  margin-top: 10px;
  text-align: center;
}

.book-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Max 2 regels tekst */
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--blood-secondary);
}

.book-year {
  font-size: 0.8rem;
  color: #888;
  margin-top: 4px;
}

/* Responsiviteit voor mobiel */
@media (max-width: 600px) {
  .cover-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 15px;
  }
}
</style>
