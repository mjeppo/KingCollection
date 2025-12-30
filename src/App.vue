<script setup>
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
// import HeaderComponent from './components/HeaderComponent.vue';
import { ref, onMounted } from 'vue';
import Balloon from './components/BalloonComponent.vue';

const balloons = ref([]);

const addBalloon = () => {
  console.log("Ballon toegevoegd!");
  const id = Date.now();
  balloons.value.push({
    id,
    left: Math.random() * 90,
    duration: 6 + Math.random() * 8, // Iets trager voor een rustiger effect
    width: 40 + Math.random() * 40
  });
};

const removeBalloon = (id) => {
  balloons.value = balloons.value.filter(b => b.id !== id);
};

// Start de ballonnenregen automatisch
onMounted(() => {
  // Laat direct een paar ballonnen opstijgen
  for(let i = 0; i < 3; i++) {
    setTimeout(addBalloon, i * 1500);
  }

  // Voeg elke 3 seconden een nieuwe toe
  setInterval(addBalloon, 10000);
});
</script>

<template>
  <main>
    <RouterView v-slot="{ Component }">
      <keep-alive>
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
    </RouterView>
  </main>

  <div class="balloon-container">
    <Balloon
      v-for="b in balloons"
      :key="b.id"
      :left="b.left"
      :duration="b.duration"
      :width="b.width"
      @finished="removeBalloon(b.id)"
    />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

.balloon-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* Cruciaal: je moet nog op boeken kunnen klikken! */
  z-index: 9999;
}
</style>
