import { AnimatePresence, motion } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { Botao } from './Botao'

type Pedido = { mensagem: string; acao: string; resolver: (ok: boolean) => void }

let atual: Pedido | null = null
const ouvintes = new Set<() => void>()

function definir(p: Pedido | null) {
  atual = p
  ouvintes.forEach((o) => o())
}

export function confirmar(mensagem: string, acao = 'Excluir') {
  return new Promise<boolean>((resolver) => definir({ mensagem, acao, resolver }))
}

export function Confirmacao() {
  const pedido = useSyncExternalStore(
    (o) => {
      ouvintes.add(o)
      return () => ouvintes.delete(o)
    },
    () => atual,
    () => atual,
  )

  const responder = (ok: boolean) => {
    pedido?.resolver(ok)
    definir(null)
  }

  return (
    <AnimatePresence>
      {pedido && (
        <motion.div
          className="fixed inset-0 z-[95] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => responder(false)}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl border border-paper/10 bg-coal p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg">{pedido.mensagem}</p>
            <div className="mt-6 flex justify-end gap-3">
              <Botao variante="fantasma" onClick={() => responder(false)}>
                Cancelar
              </Botao>
              <Botao variante="perigo" onClick={() => responder(true)} autoFocus>
                {pedido.acao}
              </Botao>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
