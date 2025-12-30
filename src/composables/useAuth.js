// src/composables/useAuth.js
import { ref, computed } from 'vue';
import pb from '@/lib/pocketbase';

// De reactieve gebruikerstoestand
const user = ref(pb.authStore.model);

// Luister naar wijzigingen in de auth store (inloggen/uitloggen)
pb.authStore.onChange((token, model) => {
    user.value = model;
}, true); // De 'true' zorgt dat hij direct vuurt bij het opzetten

// * Nieuw inlogfunctie pocketbase
export default function useAuth() {

    // Inlogfunctie
    const signIn = async (email, password) => {
        try {
            const authData = await pb.collection('users').authWithPassword(email, password);
            return { data: authData, error: null };
        } catch (err) {
            return { data: null, error: err };
        }
    };

    // Uitlogfunctie
    const signOut = () => {
        pb.authStore.clear();
        // user.value wordt automatisch null via de onChange listener
    };

    return {
        user,
        isAuthenticated: computed(() => !!user.value),
        signIn,
        signOut,
    };
}

// *Oude inlogfunctie supabase
// export default function useAuth() {

//   // 1. Controleer de initiële sessie en stel de listener in
//   onMounted(() => {
//     // Haal de huidige sessie op
//     supabase.auth.getSession().then(({ data }) => {
//       user.value = data.session?.user ?? null;
//     });

//     // Stel een listener in voor statuswijzigingen (inloggen/uitloggen)
//     supabase.auth.onAuthStateChange((_, session) => {
//       user.value = session?.user ?? null;
//     });
//   });

//   // 2. Inlogfunctie
//   const signIn = async (email, password) => {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: password,
//     });

//     // De listener stelt de user.value al in, maar we retourneren de error voor de UI
//     return { data, error };
//   };

//   // 3. Uitlogfunctie
//   const signOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     return error;
//   };

//   // 4. De publieke interface
//   return {
//     user, // De gebruiker (null als uitgelogd)
//     isAuthenticated: computed(() => !!user.value),
//     signIn,
//     signOut,
//   };
// }
