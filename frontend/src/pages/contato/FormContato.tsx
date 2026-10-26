import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { AreaDeTexto, Armadilha, Campo } from '@/components/ui/Campo'
import { Turnstile } from '@/components/ui/Turnstile'
import { Eyebrow } from '@/components/ui/Typography'
import { useEnvio } from '@/hooks/useEnvio'

export function FormContato() {
  const { enviar, enviando, erroGeral, erros, reiniciar } = useEnvio('/contato')
  const [token, setToken] = useState('')
  const [enviado, setEnviado] = useState(false)

  const aoEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const dados = Object.fromEntries(new FormData(form))
    try {
      await enviar({ ...dados, turnstile_token: token })
      form.reset()
      setEnviado(true)
    } catch {
      return
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-paper/10 bg-coal p-8 sm:p-10">
      <Eyebrow className="mb-2">Fale com a gente</Eyebrow>
      <h2 className="mb-8 font-display text-3xl font-bold">Envie uma mensagem</h2>

      <AnimatePresence mode="wait">
        {enviado ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-display text-2xl text-gold">Mensagem recebida!</p>
            <p className="mt-2 text-paper/70">Vamos responder no seu e-mail em breve.</p>
            <button
              type="button"
              onClick={() => {
                setEnviado(false)
                reiniciar()
              }}
              className="mt-6 text-xs font-semibold tracking-[0.25em] text-gold uppercase hover:underline"
            >
              Enviar outra
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={aoEnviar} exit={{ opacity: 0 }} className="relative space-y-7" noValidate>
            <Armadilha />
            <div className="grid gap-7 sm:grid-cols-2">
              <Campo name="nome" rotulo="Seu nome" required maxLength={120} autoComplete="name" erro={erros.nome} />
              <Campo name="email" type="email" rotulo="Seu e-mail" required autoComplete="email" erro={erros.email} />
            </div>
            <Campo name="assunto" rotulo="Assunto" required maxLength={200} erro={erros.assunto} />
            <AreaDeTexto name="mensagem" rotulo="Mensagem" rows={4} required maxLength={5000} erro={erros.mensagem} />
            <Turnstile aoVerificar={setToken} />
            {erroGeral && Object.keys(erros).length === 0 && <p className="text-sm text-red-400">{erroGeral}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="rounded-full border border-gold/60 px-7 py-4 text-xs font-bold tracking-[0.25em] text-gold uppercase transition hover:bg-gold hover:text-ink disabled:opacity-50"
            >
              {enviando ? 'Enviando…' : 'Enviar mensagem'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
