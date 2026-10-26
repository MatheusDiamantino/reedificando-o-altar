import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { AreaDeTexto, Armadilha, Campo } from '@/components/ui/Campo'
import { Logo } from '@/components/ui/Logo'
import { Turnstile } from '@/components/ui/Turnstile'
import { Eyebrow } from '@/components/ui/Typography'
import { useEnvio } from '@/hooks/useEnvio'
import { doDia, VERSICULOS_DE_ORACAO } from '@/lib/versiculos'

type Fase = 'escrevendo' | 'subindo' | 'recebido'

export function FormOracao() {
  const versiculoDeOracao = doDia(VERSICULOS_DE_ORACAO)
  const { enviar, enviando, erroGeral, erros, reiniciar } = useEnvio('/oracao')
  const reduzirMovimento = useReducedMotion()
  const [token, setToken] = useState('')
  const [fase, setFase] = useState<Fase>('escrevendo')

  const aoEnviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    try {
      await enviar({ ...Object.fromEntries(new FormData(form)), turnstile_token: token })
      form.reset()
      setFase(reduzirMovimento ? 'recebido' : 'subindo')
    } catch {
      return
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-linear-to-b from-[#1a1712] to-coal p-8 sm:p-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_208_0/0.14),transparent_65%)]" />

      <motion.div
        className="relative mx-auto mb-8 w-fit"
        animate={
          fase === 'recebido'
            ? { scale: [1, 1.35, 1], filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1)'] }
            : {}
        }
        transition={{ duration: 1.2 }}
      >
        <Logo className="size-20" />
      </motion.div>

      <div className="relative text-center">
        <Eyebrow className="mb-3">Pedido de oração</Eyebrow>
        <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight font-bold">
          Coloque seu pedido no altar.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-paper/65">
          Só a liderança da igreja lê os pedidos. Vamos orar por você.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {fase === 'escrevendo' && (
          <motion.form
            key="form"
            onSubmit={aoEnviar}
            noValidate
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)' }}
            transition={{ duration: 0.5 }}
            className="relative mt-10 space-y-7"
          >
            <Armadilha />
            <Campo name="nome" rotulo="Seu nome (opcional)" maxLength={120} autoComplete="name" erro={erros.nome} />
            <AreaDeTexto
              name="pedido"
              rotulo="Pelo que podemos orar?"
              rows={5}
              required
              maxLength={3000}
              erro={erros.pedido}
            />
            <Turnstile aoVerificar={setToken} />
            {erroGeral && Object.keys(erros).length === 0 && <p className="text-sm text-red-400">{erroGeral}</p>}
            <div className="text-center">
              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-gold px-8 py-4 text-xs font-bold tracking-[0.25em] text-ink uppercase transition hover:shadow-[0_0_40px_rgb(255_208_0/0.55)] disabled:opacity-50"
              >
                {enviando ? 'Enviando…' : 'Levar ao altar'}
              </button>
            </div>
          </motion.form>
        )}

        {fase === 'recebido' && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-10 text-center"
          >
            <p className="font-display text-3xl text-gold">Seu pedido chegou ao altar.</p>
            <p className="mt-3 text-paper/70">
              “{versiculoDeOracao.texto}” {versiculoDeOracao.referencia}
            </p>
            <button
              type="button"
              onClick={() => {
                reiniciar()
                setFase('escrevendo')
              }}
              className="mt-8 text-xs font-semibold tracking-[0.25em] text-gold uppercase hover:underline"
            >
              Fazer outro pedido
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {fase === 'subindo' && (
        <motion.span
          aria-hidden
          className="absolute left-1/2 size-4 -translate-x-1/2 rounded-full bg-ember shadow-[0_0_30px_10px_rgb(255_208_0/0.7)]"
          initial={{ top: '70%', scale: 3, opacity: 0 }}
          animate={{ top: ['70%', '62%', '14%'], scale: [3, 1, 0.6], opacity: [0, 1, 1], x: ['-50%', '-80%', '-50%'] }}
          transition={{ duration: 1.6, times: [0, 0.25, 1], ease: 'easeInOut' }}
          onAnimationComplete={() => setFase('recebido')}
        />
      )}
    </div>
  )
}
