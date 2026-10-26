import { useState } from 'react'
import type { Marco } from '@/lib/types'
import { Botao } from '../../ui/Botao'
import { Entrada, Texto } from '../../ui/Formulario'
import { Icone } from '../../ui/Icone'
import { BotaoSalvar, useSalvarAba, type AbaProps } from './Salvar'

export function AbaHistoria({ conteudo }: AbaProps) {
  const [marcos, setMarcos] = useState<Marco[]>(conteudo.historia)
  const { executar, salvando } = useSalvarAba()
  const mudar = (i: number, valor: Partial<Marco>) =>
    setMarcos((ms) => ms.map((m, j) => (j === i ? { ...m, ...valor } : m)))

  return (
    <>
      <p className="mb-6 text-paper/60">
        A linha do tempo da página Sobre. Enquanto estiver vazia, a seção não aparece no site.
      </p>
      <div className="space-y-4">
        {marcos.map((m, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-paper/10 bg-coal p-4">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr_auto] sm:items-end">
              <Entrada
                rotulo="Ano"
                value={m.ano}
                onChange={(e) => mudar(i, { ano: e.target.value })}
                placeholder="2015"
              />
              <Entrada rotulo="Título" value={m.titulo} onChange={(e) => mudar(i, { titulo: e.target.value })} />
              <Botao
                variante="perigo"
                onClick={() => setMarcos((ms) => ms.filter((_, j) => j !== i))}
                aria-label="Remover"
              >
                <Icone nome="lixo" />
              </Botao>
            </div>
            <Texto
              rotulo="Texto (opcional)"
              rows={3}
              value={m.texto ?? ''}
              onChange={(e) => mudar(i, { texto: e.target.value })}
            />
          </div>
        ))}
      </div>
      <Botao variante="contorno" className="mt-4" onClick={() => setMarcos((ms) => [...ms, { ano: '', titulo: '' }])}>
        <Icone nome="mais" /> Adicionar marco
      </Botao>
      <BotaoSalvar
        salvando={salvando}
        onClick={() =>
          executar({
            historia: marcos
              .filter((m) => m.ano.trim() && m.titulo.trim())
              .sort((a, b) => a.ano.localeCompare(b.ano, 'pt-BR', { numeric: true })),
          })
        }
      />
    </>
  )
}
