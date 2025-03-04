import './globals.css';
import { Orbitron } from 'next/font/google'

const orbitron = Orbitron({ subsets: ['latin'] })

export const metadata = {
  title: 'Snapdragon',
  description: 'A modern take on the classic snake game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={orbitron.className}>
      <body>{children}</body>
    </html>
  )
}
