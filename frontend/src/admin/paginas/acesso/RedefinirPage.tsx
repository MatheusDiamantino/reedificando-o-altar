import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { Botao } from '../../ui/Botao'
import { Entrada } from '../../ui/Formulario'
import { Moldura } from './Moldura'

export function RedefinirPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [diferentes, setDiferentes] = useState(false)
  const redefinir = useMutation({
    mutationFn: (senha: string) => api('/auth/redefinir', { method: 'POST', body: JSON.stringify({ token, senha }) }),
  })

  const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const dados = new FormData(e.currentTarget)
    const senha = String(dados.get('senha'))
    if (senha !== String(dados.get('confirmacao'))) {
      setDiferentes(true)
      return
    }
    setDiferentes(false)
    redefinir.mutate(senha)
  }

  const erro = redefinir.error instanceof ApiError ? redefinir.error : null

  if (!token) {
    return (
      <Moldura titulo="Link inválido">
        <Link to="/admin/esqueci" className="block text-center text-gold hover:underline">
          Pedir um link novo
        </Link>
      </Moldura>
    )
  }

  return (
    <Moldura titulo="Nova senha" subtitulo="Use pelo menos 10 caracteres.">
      {redefinir.isSuccess ? (
        <div className="space-y-4 text-center">
          <p>Senha alterada.</p>
          <Link to="/admin/entrar" className="text-gold hover:underline">
            Entrar
          </Link>
        </div>
      ) : (
        <form onSubmit={aoEnviar} className="space-y-5">
          <Entrada
            rotulo="Nova senha"
            name="senha"
            type="password"
            minLength={10}
            required
            autoComplete="new-password"
            erro={erro?.fields?.senha}
          />
          <Entrada
            rotulo="Repita a senha"
            name="confirmacao"
            type="password"
            required
            autoComplete="new-password"
            erro={diferentes ? 'As senhas não são iguais.' : undefined}
          />
          {redefinir.error && !erro?.fields && <p className="text-sm text-red-400">{redefinir.error.message}</p>}
          <Botao type="submit" carregando={redefinir.isPending} className="w-full py-3">
            Salvar senha
          </Botao>
        </form>
      )}
    </Moldura>
  )
}
