import type { FC } from 'react'

const Home: FC = () => {
  const projectTitle: string = 'KBM.Design'
  const subtitle: string = 'Interactive portfolio - Next.js 15 + TypeScript initialized'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{projectTitle}</h1>
      <p className="mt-4 text-lg">{subtitle}</p>
      <div className="mt-8 text-sm text-gray-600">
        <p>✓ Next.js 15.5.4 with App Router</p>
        <p>✓ TypeScript with strict mode</p>
        <p>✓ Tailwind CSS</p>
        <p>✓ React Three Fiber + Three.js</p>
        <p>✓ GSAP + Framer Motion</p>
      </div>
    </main>
  )
}

export default Home
