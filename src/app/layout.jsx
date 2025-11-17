import './globals.css'

export const metadata = {
  title: 'Three Dimensional Chess',
  description: 'A 3D chess game built with Next.js and React Three Fiber',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

