<template>
  <img
    src="/balloon1.png"
    alt="Ballon"
    class="balloon"
    :style="balloonStyle"
    @animationend="$emit('finished')"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  left: { type: Number, default: 50 },
  duration: { type: Number, default: 10 },
  width: { type: Number, default: 50 } // We gebruiken nu width voor de afbeelding
});

const balloonStyle = computed(() => ({
  left: `${props.left}%`,
  width: `${props.width}px`,
  animationDuration: `${props.duration}s`,
  bottom: '-150px' // Zorg dat hij diep genoeg begint zodat je de staart niet ziet
}));
</script>

<style scoped>
.balloon {
  position: fixed;
  z-index: 999;
  user-select: none;
  pointer-events: none;
  animation: floatUp linear forwards;
  /* Optioneel: voeg een lichte schommeling toe */
  transition: transform 0.5s ease-in-out;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  25% {
    transform: translateY(-25vh) rotate(5deg);
  }
  75% {
    transform: translateY(-75vh) rotate(-5deg);
  }
  100% {
    transform: translateY(-120vh) rotate(0deg);
    opacity: 0.8; /* Iets transparanter bovenin voor realisme */
  }
}
</style>
