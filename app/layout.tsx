import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
