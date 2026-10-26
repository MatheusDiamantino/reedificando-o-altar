import { motion } from 'motion/react'
import { Fragment, useState, type ElementType } from 'react'
import { entradaJaAnimada } from '@/lib/ambiente'

type Props = {
  texto: string
  as?: ElementType
  className?: string
  atraso?: number
  imediato?: boolean
}

export function RevealText({ texto, as: Tag = 'p', className, atraso = 0, imediato = false }: Props) {
  const palavras = texto.split(' ')
  const [semAnimacao] = useState(() => imediato && entradaJaAnimada())

  return (
    <Tag className={className} aria-label={texto}>
      {palavras.map((palavra, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            {imediato ? (
              <span
                className={semAnimacao ? 'inline-block' : 'inline-block animate-palavra motion-reduce:animate-none'}
                style={semAnimacao ? undefined : { animationDelay: `${atraso + i * 0.045}s` }}
              >
                {palavra}
              </span>
            ) : (
              <motion.span
                className="inline-block"
                initial={{ y: '110%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ delay: atraso + i * 0.045, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {palavra}
              </motion.span>
            )}
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
