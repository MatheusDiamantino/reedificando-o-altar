import { ApiError } from '@/lib/api'
import type { Conteudo } from '@/lib/types'
import { useSalvarConteudo } from '../../dados'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'

export type AbaProps = { conteudo: Conteudo }

export function useSalvarAba() {
  const salvar = useSalvarConteudo()
  const executar = async (dados: Partial<Conteudo>) => {
    try {
      await salvar.mutateAsync(dados)
      avisar('Salvo! Já está no site.')
    } catch (e) {
      if (e instanceof ApiError && e.fields) avisar(Object.values(e.fields)[0] ?? e.message, 'erro')
      else avisarErro(e)
    }
  }
  return { executar, salvando: salvar.isPending }
}

export function BotaoSalvar({ salvando, onClick }: { salvando: boolean; onClick: () => void }) {
  return (
    <div className="sticky bottom-16 z-10 mt-8 bg-linear-to-t from-ink via-ink to-transparent pt-10 pb-4 lg:bottom-0 lg:pb-6">
      <Botao onClick={onClick} carregando={salvando} className="w-full py-3 shadow-2xl sm:w-auto sm:px-10">
        Salvar alterações
      </Botao>
    </div>
  )
}
