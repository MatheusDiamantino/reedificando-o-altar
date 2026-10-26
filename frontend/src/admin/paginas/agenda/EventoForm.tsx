import type { FormEvent } from 'react'
import { ApiError } from '@/lib/api'
import type { Evento } from '@/lib/types'
import { useExcluirEvento, useSalvarEvento } from '../../dados'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { confirmar } from '../../ui/confirmar'
import { Entrada, Selecao, Texto } from '../../ui/Formulario'

type Props = { evento: Evento | null; dataInicial: string; aoSalvar: () => void }

export function EventoForm({ evento, dataInicial, aoSalvar }: Props) {
  const salvar = useSalvarEvento()
  const excluir = useExcluirEvento()
  const erro = salvar.error instanceof ApiError ? salvar.error : null

  const aoEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const texto = (k: string) => String(f.get(k) ?? '').trim()
    try {
      await salvar.mutateAsync({
        id: evento?.id,
        titulo: texto('titulo'),
        data: texto('data'),
        hora: texto('hora') || null,
        local: texto('local') || null,
        descricao: texto('descricao'),
        recorrencia: (texto('recorrencia') || null) as Evento['recorrencia'],
      })
      avisar(evento ? 'Evento atualizado.' : 'Evento criado.')
      aoSalvar()
    } catch (err) {
      if (!(err instanceof ApiError && err.fields)) avisarErro(err)
    }
  }

  const remover = async () => {
    if (
      !evento ||
      !(await confirmar(`Excluir “${evento.titulo}”${evento.recorrencia ? ' e todas as repetições' : ''}?`))
    )
      return
    try {
      await excluir.mutateAsync(evento.id)
      avisar('Evento excluído.')
      aoSalvar()
    } catch (err) {
      avisarErro(err)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      <Entrada
        rotulo="Título"
        name="titulo"
        defaultValue={evento?.titulo}
        required
        maxLength={200}
        autoFocus
        erro={erro?.fields?.titulo}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Entrada
          rotulo={evento?.recorrencia ? 'Primeira data' : 'Data'}
          name="data"
          type="date"
          defaultValue={evento?.data ?? dataInicial}
          required
          erro={erro?.fields?.data}
        />
        <Entrada
          rotulo="Hora"
          name="hora"
          type="time"
          defaultValue={evento?.hora?.slice(0, 5) ?? ''}
          erro={erro?.fields?.hora}
        />
      </div>
      <Selecao rotulo="Repetir" name="recorrencia" defaultValue={evento?.recorrencia ?? ''}>
        <option value="">Não repete</option>
        <option value="semanal">Toda semana</option>
        <option value="mensal">Todo mês, no mesmo dia</option>
      </Selecao>
      <Entrada
        rotulo="Local"
        name="local"
        defaultValue={evento?.local ?? ''}
        placeholder="Templo"
        maxLength={200}
        erro={erro?.fields?.local}
      />
      <Texto
        rotulo="Descrição"
        name="descricao"
        defaultValue={evento?.descricao}
        maxLength={2000}
        erro={erro?.fields?.descricao}
      />
      <div className="flex gap-3">
        <Botao type="submit" carregando={salvar.isPending} className="flex-1 py-3">
          {evento ? 'Salvar' : 'Criar evento'}
        </Botao>
        {evento && (
          <Botao variante="perigo" onClick={remover} carregando={excluir.isPending}>
            Excluir
          </Botao>
        )}
      </div>
    </form>
  )
}
