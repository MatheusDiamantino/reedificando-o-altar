import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { CursorGlow } from '@/components/layout/CursorGlow'
import { Footer } from '@/components/layout/Footer'
import { Grain } from '@/components/layout/Grain'
import { Intro } from '@/components/layout/Intro'
import { Navbar } from '@/components/layout/Navbar'
import { RouteCurtain } from '@/components/layout/RouteCurtain'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { encerrarPreRender } from '@/lib/ambiente'

export function Layout() {
  const { pathname } = useLocation()
  const outlet = useOutlet()

  useEffect(encerrarPreRender, [])

  return (
    <SmoothScroll>
      <Intro />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <RouteCurtain />
      <CursorGlow />
      <Grain />
    </SmoothScroll>
  )
}
