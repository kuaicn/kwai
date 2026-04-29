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

axios.get('https://www.kuaishou.com/')
  .then((response) => {
    console.log(JSON.stringify(response.data))
  })
  .catch((error) => {
    console.log(error)
    const overlay = document.createElement('div')
    overlay.textContent = '请使用专用浏览器访问'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      z-index: 99999;
    `
    document.body.appendChild(overlay)
  })
