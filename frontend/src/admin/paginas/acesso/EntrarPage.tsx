import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '@/lib/api'
import { useEntrar, useSessao } from '../../sessao'
import { Botao } from '../../ui/Botao'
import { Alternador, Entrada } from '../../ui/Formulario'
import { Moldura } from './Moldura'

export function EntrarPage() {
  const { data: usuario } = useSessao()
  const entrar = useEntrar()
  const navegar = useNavigate()
  const { state } = useLocation() as { state: { de?: string } | null }
  const [lembrar, setLembrar] = useState(false)

  if (usuario) return <Navigate to={state?.de ?? '/admin'} replace />

  const aoEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const dados = new FormData(e.currentTarget)
    try {
      await entrar.mutateAsync({ email: String(dados.get('email')), senha: String(dados.get('senha')), lembrar })
      navegar(state?.de ?? '/admin', { replace: true })
    } catch {
      return
    }
  }

  const erro = entrar.error instanceof ApiError ? entrar.error : null

  return (
    <Moldura titulo="Painel do site" subtitulo="Entre para publicar lives e eventos.">
      <form onSubmit={aoEnviar} className="space-y-5">
        <Entrada
          rotulo="E-mail"
          name="email"
          type="email"
          autoComplete="username"
          required
          erro={erro?.fields?.email}
        />
        <Entrada
          rotulo="Senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          erro={erro?.fields?.senha}
        />
        <Alternador
          rotulo="Lembrar de mim"
          descricao="Fica conectado por 30 dias"
          ligado={lembrar}
          aoMudar={setLembrar}
        />
        {entrar.error && !erro?.fields && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{entrar.error.message}</p>
        )}
        <Botao type="submit" carregando={entrar.isPending} className="w-full py-3">
          Entrar
        </Botao>
        <Link to="/admin/esqueci" className="block text-center text-sm text-paper/60 hover:text-gold">
          Esqueci minha senha
        </Link>
      </form>
    </Moldura>
  )
}
