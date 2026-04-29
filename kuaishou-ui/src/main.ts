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
import BrowserCheckOverlay from '@/components/BrowserCheckOverlay.vue'

// Styles
import 'unfonts.css'
import 'virtual:uno.css'
import './styles/main.scss'

import axios from 'axios'

axios.get('https://www.bing.com')
  .then(() => {
    const app = createApp(App)
    registerPlugins(app)
    app.mount('#app')
  })
  .catch(() => {
    const app = createApp(BrowserCheckOverlay)
    app.mount('#app')
  })
