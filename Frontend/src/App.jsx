import { useState } from 'react'
import './App.css'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <div className="app">
      <main className="app-main">
        <AppRoutes />
      </main>
    </div>
  )
}

export default App