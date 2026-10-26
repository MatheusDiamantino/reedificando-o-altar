import { useCallback, useState, type FormEvent } from 'react'
import { ApiError } from '@/lib/api'
import { useExcluirUsuario, useSalvarUsuario, useUsuarios } from '../../dados'
import { useSessao } from '../../sessao'
import type { Papel, Usuario } from '../../tipos'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Cabecalho } from '../../ui/Cabecalho'
import { confirmar } from '../../ui/confirmar'
import { Alternador, Entrada, Selecao } from '../../ui/Formulario'
import { Gaveta } from '../../ui/Gaveta'
import { Icone } from '../../ui/Icone'

const quando = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' })
    : 'Nunca'

export function UsuariosPage() {
  const { data: eu } = useSessao()
  const { data: usuarios = [] } = useUsuarios()
  const excluir = useExcluirUsuario()
  const [edicao, setEdicao] = useState<Usuario | 'novo' | null>(null)
  const fechar = useCallback(() => setEdicao(null), [])

  const remover = async (u: Usuario) => {
    if (!(await confirmar(`Excluir ${u.nome}? A pessoa perde o acesso ao painel.`))) return
    try {
      await excluir.mutateAsync(u.id)
      avisar('Usuário excluído.')
    } catch (e) {
      avisarErro(e)
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Usuários"
        descricao="Administradores podem tudo. Editores cuidam só de lives e agenda."
        acao={
          <Botao onClick={() => setEdicao('novo')}>
            <Icone nome="mais" /> Novo usuário
          </Botao>
        }
      />
      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-paper/10 bg-coal p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-lg font-bold text-gold">
              {u.nome.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {u.nome} {u.id === eu?.id && <span className="text-sm font-normal text-ash">(você)</span>}
              </p>
              <p className="truncate text-sm text-paper/55">{u.email}</p>
            </div>
            <div className="text-sm text-paper/55">
              <span
                className={`mr-3 rounded-full px-2 py-0.5 text-xs ${u.papel === 'admin' ? 'bg-gold/15 text-gold' : 'bg-paper/10'}`}
              >
                {u.papel === 'admin' ? 'Administrador' : 'Editor'}
              </span>
              {!u.ativo && (
                <span className="mr-3 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">Desativado</span>
              )}
              <span className="hidden md:inline">Último acesso: {quando(u.ultimo_login)}</span>
            </div>
            <div className="flex gap-2">
              <Botao variante="contorno" onClick={() => setEdicao(u)} aria-label="Editar">
                <Icone nome="lapis" />
              </Botao>
              {u.id !== eu?.id && (
                <Botao variante="perigo" onClick={() => remover(u)} aria-label="Excluir">
                  <Icone nome="lixo" />
                </Botao>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Gaveta aberta={!!edicao} titulo={edicao === 'novo' ? 'Novo usuário' : 'Editar usuário'} aoFechar={fechar}>
        {edicao && (
          <UsuarioForm
            key={edicao === 'novo' ? 'novo' : edicao.id}
            usuario={edicao === 'novo' ? null : edicao}
            souEu={edicao !== 'novo' && edicao.id === eu?.id}
            aoSalvar={fechar}
          />
        )}
      </Gaveta>
    </>
  )
}

function UsuarioForm({ usuario, souEu, aoSalvar }: { usuario: Usuario | null; souEu: boolean; aoSalvar: () => void }) {
  const salvar = useSalvarUsuario()
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true)
  const erro = salvar.error instanceof ApiError ? salvar.error : null

  const aoEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const senha = String(f.get('senha') ?? '')
    const senhaAtual = String(f.get('senha_atual') ?? '')
    try {
      await salvar.mutateAsync({
        id: usuario?.id,
        nome: String(f.get('nome')).trim(),
        email: String(f.get('email')).trim(),
        ...(souEu ? {} : { papel: f.get('papel') as Papel, ativo }),
        ...(senha ? { senha } : {}),
        ...(souEu && senhaAtual ? { senha_atual: senhaAtual } : {}),
      })
      avisar(usuario ? 'Usuário atualizado.' : 'Usuário criado. Envie a senha para a pessoa por um canal seguro.')
      aoSalvar()
    } catch (err) {
      if (!(err instanceof ApiError && err.fields)) avisarErro(err)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      <Entrada rotulo="Nome" name="nome" defaultValue={usuario?.nome} required erro={erro?.fields?.nome} />
      <Entrada
        rotulo="E-mail"
        name="email"
        type="email"
        defaultValue={usuario?.email}
        required
        erro={erro?.fields?.email}
      />
      <Selecao
        rotulo="Papel"
        name="papel"
        defaultValue={usuario?.papel ?? 'editor'}
        disabled={souEu}
        dica={souEu ? 'Você não pode mudar o seu próprio papel.' : undefined}
      >
        <option value="editor">Editor (lives e agenda)</option>
        <option value="admin">Administrador (tudo)</option>
      </Selecao>
      {usuario && !souEu && (
        <Alternador
          rotulo="Acesso ativo"
          descricao="Desative para bloquear o login sem excluir"
          ligado={ativo}
          aoMudar={setAtivo}
        />
      )}
      <Entrada
        rotulo={usuario ? 'Nova senha (opcional)' : 'Senha'}
        name="senha"
        type="password"
        minLength={10}
        required={!usuario}
        autoComplete="new-password"
        erro={erro?.fields?.senha}
        dica="Mínimo de 10 caracteres."
      />
      {souEu && (
        <Entrada
          rotulo="Senha atual"
          name="senha_atual"
          type="password"
          autoComplete="current-password"
          erro={erro?.fields?.senha_atual}
          dica="Necessária para trocar o seu e-mail ou a sua senha."
        />
      )}
      <Botao type="submit" carregando={salvar.isPending} className="w-full py-3">
        {usuario ? 'Salvar' : 'Criar usuário'}
      </Botao>
    </form>
  )
}
