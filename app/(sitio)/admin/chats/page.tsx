import type { Metadata } from 'next'
import ChatsCliente from './ChatsCliente'

export const metadata: Metadata = {
  title: 'Chats — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaChatsRoute() {
  return <ChatsCliente />
}
