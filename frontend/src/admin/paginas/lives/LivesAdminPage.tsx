import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { capaDaLive, dataLonga } from '@/lib/lives'
import type { Live } from '@/lib/types'
import { useEditarLive, useExcluirLive, useLivesAdmin } from '../../dados'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Cabecalho, Vazio } from '../../ui/Cabecalho'
import { confirmar } from '../../ui/confirmar'
import { Gaveta } from '../../ui/Gaveta'
import { Icone } from '../../ui/Icone'
import { LiveForm } from './LiveForm'

export function LivesAdminPage() {
  const [params, setParams] = useSearchParams()
  const { data: lives = [], isLoading } = useLivesAdmin()
  const editar = useEditarLive()
  const excluir = useExcluirLive()
  const [editando, setEditando] = useState<Live | null>(null)
  const nova = params.get('nova') === '1'

  const fechar = useCallback(() => {
    setEditando(null)
    if (params.has('nova')) setParams({}, { replace: true })
  }, [params, setParams])

  const alternarAoVivo = async (live: Live) => {
    try {
      await editar.mutateAsync({ id: live.id, ao_vivo: !live.ao_vivo })
      avisar(live.ao_vivo ? 'Live encerrada no site.' : 'Selo “Ao vivo” ligado no site.')
    } catch (e) {
      avisarErro(e)
    }
  }

  const remover = async (live: Live) => {
    if (!(await confirmar(`Excluir “${live.titulo}”? A capa também será apagada.`))) return
    try {
      await excluir.mutateAsync(live.id)
      avisar('Live excluída.')
    } catch (e) {
      avisarErro(e)
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Lives"
        descricao={`${lives.length} publicadas`}
        acao={
          <Botao onClick={() => setParams({ nova: '1' })}>
            <Icone nome="mais" /> Nova live
          </Botao>
        }
      />

      {isLoading ? (
        <p className="text-paper/60">Carregando…</p>
      ) : lives.length === 0 ? (
        <Vazio>Nenhuma live ainda. Clique em “Nova live” e cole o link do YouTube.</Vazio>
      ) : (
        <ul className="space-y-3">
          {lives.map((live) => (
            <li
              key={live.id}
              className="flex flex-col gap-4 rounded-2xl border border-paper/10 bg-coal p-3 sm:flex-row sm:items-center sm:p-4"
            >
              <img
                src={capaDaLive(live)}
                alt=""
                className="aspect-video w-full rounded-xl object-cover sm:w-40"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-2">
                  {live.ao_vivo && (
                    <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold text-ink uppercase">
                      Ao vivo
                    </span>
                  )}
                  {live.destaque && (
                    <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[10px] text-gold uppercase">
                      Destaque
                    </span>
                  )}
                  <span className="text-xs text-ash uppercase">{live.plataforma}</span>
                </div>
                <p className="truncate font-display text-lg font-semibold">{live.titulo}</p>
                <p className="text-sm text-paper/55">{dataLonga(live.data_live)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Botao
                  variante={live.ao_vivo ? 'ouro' : 'contorno'}
                  onClick={() => alternarAoVivo(live)}
                  className="flex-1 sm:flex-none"
                >
                  {live.ao_vivo ? 'Encerrar' : 'Ao vivo'}
                </Botao>
                <Botao variante="contorno" onClick={() => setEditando(live)} aria-label="Editar">
                  <Icone nome="lapis" />
                </Botao>
                <Botao variante="perigo" onClick={() => remover(live)} aria-label="Excluir">
                  <Icone nome="lixo" />
                </Botao>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Gaveta aberta={nova || !!editando} titulo={editando ? 'Editar live' : 'Nova live'} aoFechar={fechar}>
        <LiveForm key={editando?.id ?? 'nova'} live={editando} aoSalvar={fechar} />
      </Gaveta>
    </>
  )
}
