import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

type Props = { texto: string; className?: string }

function Palavra({
  palavra,
  progresso,
  faixa,
}: {
  palavra: string
  progresso: MotionValue<number>
  faixa: [number, number]
}) {
  const opacidade = useTransform(progresso, faixa, [0.14, 1])
  const brilho = useTransform(progresso, faixa, ['0 0 0 rgb(255 208 0 / 0)', '0 0 28px rgb(255 208 0 / 0.35)'])
  return (
    <motion.span style={{ opacity: opacidade, textShadow: brilho }} className="inline-block">
      {palavra}&nbsp;
    </motion.span>
  )
}

export function ScrollHighlight({ texto, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const palavras = texto.split(' ')

  return (
    <p ref={ref} className={className} aria-label={texto}>
      {palavras.map((palavra, i) => (
        <Palavra
          key={i}
          palavra={palavra}
          progresso={scrollYProgress}
          faixa={[i / palavras.length, (i + 1) / palavras.length]}
        />
      ))}
    </p>
  )
}
