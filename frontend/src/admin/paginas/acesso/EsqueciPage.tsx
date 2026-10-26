import { useMutation } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Botao } from '../../ui/Botao'
import { Entrada } from '../../ui/Formulario'
import { Moldura } from './Moldura'

export function EsqueciPage() {
  const pedir = useMutation({
    mutationFn: (email: string) => api('/auth/esqueci', { method: 'POST', body: JSON.stringify({ email }) }),
  })

  const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    pedir.mutate(String(new FormData(e.currentTarget).get('email')))
  }

  return (
    <Moldura titulo="Esqueci a senha" subtitulo="Enviamos um link para criar uma senha nova.">
      {pedir.isSuccess ? (
        <div className="space-y-4 text-center">
          <p>Se o e-mail estiver cadastrado, o link chega em instantes. Ele vale por 60 minutos.</p>
          <Link to="/admin/entrar" className="text-sm text-gold hover:underline">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={aoEnviar} className="space-y-5">
          <Entrada rotulo="E-mail" name="email" type="email" required autoComplete="username" />
          {pedir.error && <p className="text-sm text-red-400">{pedir.error.message}</p>}
          <Botao type="submit" carregando={pedir.isPending} className="w-full py-3">
            Enviar link
          </Botao>
          <Link to="/admin/entrar" className="block text-center text-sm text-paper/60 hover:text-gold">
            Voltar
          </Link>
        </form>
      )}
    </Moldura>
  )
}
