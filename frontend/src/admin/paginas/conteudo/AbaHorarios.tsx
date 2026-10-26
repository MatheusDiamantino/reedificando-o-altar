import { useState } from 'react'
import { NOME_DIA } from '@/lib/horarios'
import type { Horario } from '@/lib/types'
import { Botao } from '../../ui/Botao'
import { Entrada, Selecao } from '../../ui/Formulario'
import { Icone } from '../../ui/Icone'
import { BotaoSalvar, useSalvarAba, type AbaProps } from './Salvar'

export function AbaHorarios({ conteudo }: AbaProps) {
  const [horarios, setHorarios] = useState<Horario[]>(conteudo.horarios)
  const { executar, salvando } = useSalvarAba()

  const mudar = (i: number, campo: keyof Horario, valor: string) =>
    setHorarios((hs) => hs.map((h, j) => (j === i ? { ...h, [campo]: valor } : h)))

  return (
    <>
      <p className="mb-6 text-paper/60">
        Os cultos fixos. Aparecem na página inicial, na contagem regressiva e no rodapé.
      </p>
      <div className="space-y-4">
        {horarios.map((h, i) => (
          <div
            key={i}
            className="grid gap-4 rounded-2xl border border-paper/10 bg-coal p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
          >
            <Selecao rotulo="Dia" value={h.dia} onChange={(e) => mudar(i, 'dia', e.target.value)}>
              {Object.entries(NOME_DIA).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </Selecao>
            <Entrada
              rotulo="Início"
              type="time"
              value={h.inicio}
              onChange={(e) => mudar(i, 'inicio', e.target.value)}
            />
            <Entrada rotulo="Fim" type="time" value={h.fim} onChange={(e) => mudar(i, 'fim', e.target.value)} />
            <Botao
              variante="perigo"
              onClick={() => setHorarios((hs) => hs.filter((_, j) => j !== i))}
              aria-label="Remover"
            >
              <Icone nome="lixo" />
            </Botao>
            <div className="sm:col-span-4">
              <Entrada rotulo="Nome do culto" value={h.nome} onChange={(e) => mudar(i, 'nome', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <Botao
        variante="contorno"
        className="mt-4"
        onClick={() => setHorarios((hs) => [...hs, { dia: 'domingo', inicio: '19:00', fim: '20:30', nome: 'Culto' }])}
      >
        <Icone nome="mais" /> Adicionar horário
      </Botao>
      <BotaoSalvar salvando={salvando} onClick={() => executar({ horarios })} />
    </>
  )
}
