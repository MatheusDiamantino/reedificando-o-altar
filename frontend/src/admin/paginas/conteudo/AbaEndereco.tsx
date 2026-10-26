import { useState } from 'react'
import type { Conteudo } from '@/lib/types'
import { Entrada } from '../../ui/Formulario'
import { BotaoSalvar, useSalvarAba, type AbaProps } from './Salvar'

export function AbaEndereco({ conteudo }: AbaProps) {
  const [endereco, setEndereco] = useState<Conteudo['endereco']>(conteudo.endereco)
  const [redes, setRedes] = useState<Conteudo['redes']>(conteudo.redes)
  const [email, setEmail] = useState(conteudo.email)
  const { executar, salvando } = useSalvarAba()

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Endereço</h2>
        <Entrada
          rotulo="Rua e número"
          value={endereco.rua}
          onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
          <Entrada
            rotulo="Cidade"
            value={endereco.cidade}
            onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
          />
          <Entrada
            rotulo="UF"
            maxLength={2}
            value={endereco.uf}
            onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase() })}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Contato e redes</h2>
        <Entrada rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Entrada
          rotulo="WhatsApp"
          value={redes.whatsapp}
          onChange={(e) => setRedes({ ...redes, whatsapp: e.target.value })}
          placeholder="5511999999999"
          dica="Com DDI e DDD, só números. Vazio esconde o botão."
        />
        <Entrada
          rotulo="Instagram"
          type="url"
          value={redes.instagram}
          onChange={(e) => setRedes({ ...redes, instagram: e.target.value })}
        />
        <Entrada
          rotulo="Página no Facebook"
          type="url"
          value={redes.facebook}
          onChange={(e) => setRedes({ ...redes, facebook: e.target.value })}
        />
        <Entrada
          rotulo="Grupo no Facebook"
          type="url"
          value={redes.facebook_grupo}
          onChange={(e) => setRedes({ ...redes, facebook_grupo: e.target.value })}
        />
      </section>

      <BotaoSalvar salvando={salvando} onClick={() => executar({ endereco, redes, email })} />
    </div>
  )
}
