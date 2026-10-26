import { useDeferredValue, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '@/lib/api'
import { capaDaLive } from '@/lib/lives'
import type { Live } from '@/lib/types'
import { useCriarLive, useEditarLive, useEnviarCapa, useOEmbed } from '../../dados'
import { avisar, avisarErro } from '../../ui/avisos'
import { Botao } from '../../ui/Botao'
import { Alternador, Entrada, Texto } from '../../ui/Formulario'
import { Icone } from '../../ui/Icone'

function agoraLocal() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).replace(' ', 'T').slice(0, 16)
}

export function LiveForm({ live, aoSalvar }: { live: Live | null; aoSalvar: () => void }) {
  const criar = useCriarLive()
  const editar = useEditarLive()
  const enviarCapa = useEnviarCapa()
  const arquivo = useRef<HTMLInputElement>(null)

  const [link, setLink] = useState(live?.link ?? '')
  const [titulo, setTitulo] = useState(live?.titulo ?? '')
  const [tituloTocado, setTituloTocado] = useState(!!live)
  const [descricao, setDescricao] = useState(live?.descricao ?? '')
  const [data, setData] = useState(live?.data_live.slice(0, 16) ?? agoraLocal())
  const [aoVivo, setAoVivo] = useState(live?.ao_vivo ?? false)
  const [destaque, setDestaque] = useState(live?.destaque ?? false)

  const linkAdiado = useDeferredValue(link.trim())
  const linkMudou = !live || linkAdiado !== live.link
  const { data: previa, isFetching: buscando, error: erroPrevia } = useOEmbed(linkMudou ? linkAdiado : '')
  const tituloSugerido = previa?.titulo ?? ''
  const tituloFinal = tituloTocado ? titulo : titulo || tituloSugerido

  const salvando = criar.isPending || editar.isPending
  const erro = (criar.error ?? editar.error) instanceof ApiError ? ((criar.error ?? editar.error) as ApiError) : null

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault()
    const dados = { link: link.trim(), titulo: tituloFinal, descricao, data_live: data, ao_vivo: aoVivo, destaque }
    try {
      if (live)
        await editar.mutateAsync({ id: live.id, ...dados, baixar_capa: linkMudou && previa?.plataforma === 'youtube' })
      else await criar.mutateAsync({ ...dados, baixar_capa: true })
      avisar(live ? 'Live atualizada.' : 'Live publicada no site!')
      aoSalvar()
    } catch (err) {
      if (!(err instanceof ApiError && err.fields)) avisarErro(err)
    }
  }

  const trocarCapa = async (f: File | undefined) => {
    if (!f || !live) return
    try {
      await enviarCapa.mutateAsync({ id: live.id, arquivo: f })
      avisar('Capa atualizada.')
    } catch (err) {
      avisarErro(err)
    }
  }

  const capaPrevia = previa?.thumbnail_url ?? (live ? capaDaLive(live) : null)

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      <Entrada
        rotulo="Link da live"
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=…"
        required
        autoFocus={!live}
        erro={erro?.fields?.link}
        dica={
          buscando
            ? 'Buscando título e capa…'
            : erroPrevia
              ? 'Não achei dados desse link. Preencha o título à mão.'
              : 'YouTube ou Facebook'
        }
      />

      {capaPrevia && (
        <div className="relative overflow-hidden rounded-xl">
          <img src={capaPrevia} alt="Capa da live" className="aspect-video w-full object-cover" />
          {live && (
            <div className="absolute right-3 bottom-3">
              <input
                ref={arquivo}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => trocarCapa(e.target.files?.[0])}
              />
              <Botao
                variante="contorno"
                className="bg-ink/80 backdrop-blur"
                carregando={enviarCapa.isPending}
                onClick={() => arquivo.current?.click()}
              >
                <Icone nome="imagem" /> Trocar capa
              </Botao>
            </div>
          )}
        </div>
      )}

      <Entrada
        rotulo="Título"
        value={tituloFinal}
        onChange={(e) => {
          setTituloTocado(true)
          setTitulo(e.target.value)
        }}
        required
        maxLength={200}
        erro={erro?.fields?.titulo}
      />
      <Texto
        rotulo="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        maxLength={2000}
        erro={erro?.fields?.descricao}
      />
      <Entrada
        rotulo="Data e hora"
        type="datetime-local"
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        erro={erro?.fields?.data_live}
      />
      <Alternador
        rotulo="Ao vivo agora"
        descricao="Mostra o selo “Ao vivo” em todo o site"
        ligado={aoVivo}
        aoMudar={setAoVivo}
      />
      <Alternador
        rotulo="Destaque"
        descricao="Aparece primeiro na página de lives"
        ligado={destaque}
        aoMudar={setDestaque}
      />

      <Botao type="submit" carregando={salvando} className="w-full py-3">
        {live ? 'Salvar alterações' : 'Publicar live'}
      </Botao>
    </form>
  )
}
