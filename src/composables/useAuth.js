// src/composables/useAuth.js
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/supabase';

// De reactieve gebruikerstoestand
const user = ref(null);

export default function useAuth() {

  // 1. Controleer de initiële sessie en stel de listener in
  onMounted(() => {
    // Haal de huidige sessie op
    supabase.auth.getSession().then(({ data }) => {
      user.value = data.session?.user ?? null;
    });

    // Stel een listener in voor statuswijzigingen (inloggen/uitloggen)
    supabase.auth.onAuthStateChange((_, session) => {
      user.value = session?.user ?? null;
    });
  });

  // 2. Inlogfunctie
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // De listener stelt de user.value al in, maar we retourneren de error voor de UI
    return { data, error };
  };

  // 3. Uitlogfunctie
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return error;
  };

  // 4. De publieke interface
  return {
    user, // De gebruiker (null als uitgelogd)
    isAuthenticated: computed(() => !!user.value),
    signIn,
    signOut,
  };
}
