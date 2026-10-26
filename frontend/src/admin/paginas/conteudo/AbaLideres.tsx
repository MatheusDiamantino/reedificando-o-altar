import { useRef, useState } from 'react'
import type { Lider } from '@/lib/types'
import { useEnviarImagem } from '../../dados'
import { avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Entrada } from '../../ui/Formulario'
import { Icone } from '../../ui/Icone'
import { BotaoSalvar, useSalvarAba, type AbaProps } from './Salvar'

export function AbaLideres({ conteudo }: AbaProps) {
  const [lideres, setLideres] = useState<Lider[]>(conteudo.lideres)
  const { executar, salvando } = useSalvarAba()

  const mudar = (i: number, valor: Partial<Lider>) =>
    setLideres((ls) => ls.map((l, j) => (j === i ? { ...l, ...valor } : l)))
  const mover = (i: number, passo: number) =>
    setLideres((ls) => {
      const novo = [...ls]
      const [item] = novo.splice(i, 1)
      novo.splice(i + passo, 0, item)
      return novo
    })

  return (
    <>
      <p className="mb-6 text-paper/60">Aparecem na página Sobre, nesta ordem.</p>
      <div className="space-y-4">
        {lideres.map((l, i) => (
          <CartaoLider
            key={`${i}-${l.foto}`}
            lider={l}
            primeiro={i === 0}
            ultimo={i === lideres.length - 1}
            aoMudar={(v) => mudar(i, v)}
            aoMover={(passo) => mover(i, passo)}
            aoRemover={() => setLideres((ls) => ls.filter((_, j) => j !== i))}
          />
        ))}
      </div>
      <Botao
        variante="contorno"
        className="mt-4"
        onClick={() => setLideres((ls) => [...ls, { nome: '', cargo: '', foto: '' }])}
      >
        <Icone nome="mais" /> Adicionar líder
      </Botao>
      <BotaoSalvar salvando={salvando} onClick={() => executar({ lideres: lideres.filter((l) => l.nome.trim()) })} />
    </>
  )
}

type CartaoProps = {
  lider: Lider
  primeiro: boolean
  ultimo: boolean
  aoMudar: (v: Partial<Lider>) => void
  aoMover: (passo: number) => void
  aoRemover: () => void
}

function CartaoLider({ lider, primeiro, ultimo, aoMudar, aoMover, aoRemover }: CartaoProps) {
  const arquivo = useRef<HTMLInputElement>(null)
  const enviar = useEnviarImagem()

  const trocarFoto = async (f: File | undefined) => {
    if (!f) return
    try {
      aoMudar({ foto: (await enviar.mutateAsync(f)).url })
    } catch (e) {
      avisarErro(e)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-paper/10 bg-coal p-4 sm:flex-row">
      <button
        type="button"
        onClick={() => arquivo.current?.click()}
        className="group relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-xl bg-ink sm:w-32"
      >
        {lider.foto ? (
          <img src={lider.foto} alt="" className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-paper/40">
            <Icone nome="imagem" className="size-8" />
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-ink/70 text-xs font-semibold opacity-0 transition group-hover:opacity-100">
          {enviar.isPending ? 'Enviando…' : 'Trocar foto'}
        </span>
      </button>
      <input
        ref={arquivo}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => trocarFoto(e.target.files?.[0])}
      />
      <div className="flex-1 space-y-4">
        <Entrada rotulo="Nome" value={lider.nome} onChange={(e) => aoMudar({ nome: e.target.value })} />
        <Entrada
          rotulo="Cargo"
          value={lider.cargo}
          onChange={(e) => aoMudar({ cargo: e.target.value })}
          placeholder="Pastor, Evangelista…"
        />
      </div>
      <div className="flex gap-2 sm:flex-col">
        <Botao variante="fantasma" disabled={primeiro} onClick={() => aoMover(-1)} aria-label="Subir">
          ↑
        </Botao>
        <Botao variante="fantasma" disabled={ultimo} onClick={() => aoMover(1)} aria-label="Descer">
          ↓
        </Botao>
        <Botao variante="perigo" onClick={aoRemover} aria-label="Remover">
          <Icone nome="lixo" />
        </Botao>
      </div>
    </div>
  )
}
