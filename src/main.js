import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import router from './router'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css" // Importeer de CSS

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(router)

const options = {
  timeout: 3000,
  position: 'bottom-right',
}

app.use(Toast, options)

app.mount('#app')
