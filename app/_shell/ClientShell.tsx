'use client'

// ssr:false sólo es válido desde un Client Component. Aquí se hace el dynamic
// import del árbol de la app (App.tsx + providers) sin SSR: el body se renderiza
// en cliente, igual que el SPA original (= nada roto).
import dynamic from 'next/dynamic'

const AppShell = dynamic(() => import('./AppShell'), {
  ssr: false,
  loading: () => null,
})

export default function ClientShell() {
  return <AppShell />
}
