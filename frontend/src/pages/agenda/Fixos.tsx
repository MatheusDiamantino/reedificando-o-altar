import { motion } from 'motion/react'
import { Eyebrow } from '@/components/ui/Typography'
import { formatarHora, NOME_DIA } from '@/lib/horarios'
import { diaDaSemana, DIAS_CURTOS } from '@/lib/datas'
import { useConteudo } from '@/lib/queries'
import type { Evento } from '@/lib/types'

const DIAS_LONGOS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function Fixos({ semanais }: { semanais: Evento[] }) {
  const { data: c } = useConteudo()
  const cultos = (c?.horarios ?? []).map((h) => ({
    chave: `h-${h.dia}-${h.inicio}`,
    dia: NOME_DIA[h.dia],
    hora: `${formatarHora(h.inicio)} às ${formatarHora(h.fim)}`,
    titulo: h.nome,
  }))
  const extras = semanais
    .filter((e) => !cultos.some((cu) => cu.titulo === e.titulo))
    .map((e) => ({
      chave: `e-${e.id}`,
      dia: DIAS_LONGOS[diaDaSemana(e.data)],
      hora: e.hora ? formatarHora(e.hora.slice(0, 5)) : DIAS_CURTOS[diaDaSemana(e.data)],
      titulo: e.titulo,
    }))
  const itens = [...cultos, ...extras]
  if (itens.length === 0) return null

  return (
    <section className="border-b border-paper/10 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <Eyebrow className="mb-10">Toda semana</Eyebrow>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((item, i) => (
            <motion.li
              key={item.chave}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="relative overflow-hidden rounded-[1.5rem] border border-gold/30 bg-linear-to-br from-gold/10 to-transparent p-8"
            >
              <p className="font-display text-4xl font-bold text-gold">{item.dia}</p>
              <p className="mt-2 text-lg text-paper/80">{item.hora}</p>
              <p className="mt-6 font-display text-xl font-semibold">{item.titulo}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
