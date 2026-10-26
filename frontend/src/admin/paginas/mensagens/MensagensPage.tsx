import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useExcluirMensagem, useMarcarMensagem, useMensagens } from '../../dados'
import type { Mensagem } from '../../tipos'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Cabecalho, Vazio } from '../../ui/Cabecalho'
import { confirmar } from '../../ui/confirmar'
import { Alternador } from '../../ui/Formulario'

const FILTROS: { valor: '' | Mensagem['tipo']; rotulo: string }[] = [
  { valor: '', rotulo: 'Todas' },
  { valor: 'oracao', rotulo: 'Pedidos de oração' },
  { valor: 'contato', rotulo: 'Contato' },
]

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })

export function MensagensPage() {
  const [tipo, setTipo] = useState<'' | Mensagem['tipo']>('')
  const [soNaoLidas, setSoNaoLidas] = useState(false)
  const [aberta, setAberta] = useState<number | null>(null)
  const { data: mensagens = [], isLoading } = useMensagens(tipo, soNaoLidas ? 'false' : '')
  const marcar = useMarcarMensagem()
  const excluir = useExcluirMensagem()

  const abrir = (m: Mensagem) => {
    setAberta(aberta === m.id ? null : m.id)
    if (!m.lida && !soNaoLidas) marcar.mutate({ id: m.id, lida: true })
  }

  const remover = async (m: Mensagem) => {
    if (!(await confirmar('Excluir esta mensagem?'))) return
    try {
      await excluir.mutateAsync(m.id)
      avisar('Mensagem excluída.')
    } catch (e) {
      avisarErro(e)
    }
  }

  return (
    <>
      <Cabecalho titulo="Mensagens" descricao="Pedidos de oração e mensagens do formulário de contato." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            onClick={() => setTipo(f.valor)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tipo === f.valor ? 'bg-gold text-ink' : 'border border-paper/15 text-paper/70 hover:border-gold/50'
            }`}
          >
            {f.rotulo}
          </button>
        ))}
        <div className="w-full sm:ml-auto sm:w-64">
          <Alternador rotulo="Só não lidas" ligado={soNaoLidas} aoMudar={setSoNaoLidas} />
        </div>
      </div>

      {isLoading ? (
        <p className="text-paper/60">Carregando…</p>
      ) : mensagens.length === 0 ? (
        <Vazio>Nenhuma mensagem por aqui.</Vazio>
      ) : (
        <ul className="space-y-2">
          {mensagens.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border bg-coal transition ${m.lida ? 'border-paper/5' : 'border-gold/40'}`}
            >
              <button type="button" onClick={() => abrir(m)} className="flex w-full items-start gap-4 p-4 text-left">
                <span
                  className={`mt-2 size-2 shrink-0 rounded-full ${m.lida ? 'bg-transparent' : 'bg-gold shadow-[0_0_10px_rgb(255_208_0)]'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`font-semibold ${m.lida ? 'text-paper/70' : ''}`}>{m.nome || 'Anônimo'}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                        m.tipo === 'oracao' ? 'bg-gold/15 text-gold' : 'bg-paper/10 text-paper/70'
                      }`}
                    >
                      {m.tipo === 'oracao' ? 'Oração' : 'Contato'}
                    </span>
                    <span className="text-xs text-ash">{quando(m.criado_em)}</span>
                  </span>
                  <span className={`mt-1 block ${aberta === m.id ? '' : 'truncate'} text-paper/60`}>
                    {m.assunto ? `${m.assunto} · ` : ''}
                    {aberta === m.id ? '' : m.texto}
                  </span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {aberta === m.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 px-4 pb-4 pl-10">
                      <p className="whitespace-pre-line">{m.texto}</p>
                      {m.email && <p className="text-sm text-paper/60">{m.email}</p>}
                      <div className="flex flex-wrap gap-2">
                        {m.email && (
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.assunto ?? 'Sua mensagem'}`)}`}
                            className="inline-flex items-center rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink"
                          >
                            Responder por e-mail
                          </a>
                        )}
                        <Botao variante="contorno" onClick={() => marcar.mutate({ id: m.id, lida: !m.lida })}>
                          Marcar como {m.lida ? 'não lida' : 'lida'}
                        </Botao>
                        <Botao variante="perigo" onClick={() => remover(m)}>
                          Excluir
                        </Botao>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
