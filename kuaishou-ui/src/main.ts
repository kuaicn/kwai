/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'
import 'virtual:uno.css'
import './styles/main.scss'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

import axios from 'axios'
import { showBrowserWarning } from '@/composables/useBrowserCheck'

axios.get('https://www.kuaishou.com/')
  .then((response) => {
    console.log(JSON.stringify(response.data))
  })
  .catch((error) => {
    console.log(error)
    showBrowserWarning.value = true
  })
