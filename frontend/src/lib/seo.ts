export type Meta = { titulo: string; descricao: string }

const MARCA = 'Ministério Reedificando o Altar'

export const SEO: Record<string, Meta> = {
  '/': {
    titulo: `${MARCA} | Igreja evangélica em Barueri/SP`,
    descricao:
      'Igreja evangélica em Barueri/SP. Cultos aos domingos, das 9h às 10h30, na Rua Presidente Nilo Peçanha, 775. Assista às lives e venha nos visitar.',
  },
  '/sobre': {
    titulo: `Sobre | ${MARCA}`,
    descricao:
      'Conheça o chamado do Ministério Reedificando o Altar, nossa liderança e a visão de uma vida inteira entregue no altar de Deus.',
  },
  '/lives': {
    titulo: `Lives e cultos | ${MARCA}`,
    descricao: 'Assista aos cultos e lives do Ministério Reedificando o Altar, ao vivo ou quando quiser.',
  },
  '/agenda': {
    titulo: `Agenda | ${MARCA}`,
    descricao: 'Cultos, encontros e eventos do Ministério Reedificando o Altar em Barueri/SP.',
  },
  '/visite': {
    titulo: `Visite-nos em Barueri/SP | ${MARCA}`,
    descricao:
      'Rua Presidente Nilo Peçanha, 775, Barueri/SP. Cultos aos domingos, das 9h às 10h30. Veja como chegar e o que esperar da sua primeira visita.',
  },
  '/contato': {
    titulo: `Contato e pedidos de oração | ${MARCA}`,
    descricao: 'Fale com o Ministério Reedificando o Altar ou envie seu pedido de oração.',
  },
}

export const ROTAS_PUBLICAS = Object.keys(SEO)
