import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const mountNode =
  document.getElementById('root14') ||
  document.getElementById('app14') ||
  (() => {
    const node = document.createElement('div')
    node.id = 'root14'
    document.body.appendChild(node)
    return node
  })()

createRoot(mountNode).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
