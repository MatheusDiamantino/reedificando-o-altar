import type { Conteudo } from './types'

export const conteudoPadrao: Conteudo = {
  lideres: [
    { nome: 'Pastor Doze', cargo: 'Pastor', foto: '/img/lideres/pastor-doze.webp' },
    { nome: 'Flávia', cargo: 'Pastora', foto: '/img/lideres/pastora-flavia.webp' },
    { nome: 'Marcelo', cargo: 'Presbítero', foto: '/img/lideres/presbitero-marcelo.webp' },
    { nome: 'Camila', cargo: 'Presbítera', foto: '/img/lideres/presbitera-camila.webp' },
    { nome: 'Cinthía', cargo: 'Evangelista', foto: '/img/lideres/evangelista-cinthia.webp' },
    { nome: 'Andrea', cargo: 'Evangelista', foto: '/img/lideres/evangelista-andrea.webp' },
  ],
  historia: [],
  horarios: [{ dia: 'domingo', inicio: '09:00', fim: '10:30', nome: 'Culto de Celebração' }],
  endereco: {
    rua: 'Rua Presidente Nilo Peçanha, 775',
    cidade: 'Barueri',
    uf: 'SP',
    maps_url:
      'https://www.google.com/maps/search/?api=1&query=Rua+Presidente+Nilo+Pe%C3%A7anha%2C+775%2C+Jardim+Itaquiti%2C+Barueri+-+SP',
    lat: -23.5172,
    lng: -46.9026,
  },
  redes: {
    facebook_grupo: 'https://www.facebook.com/groups/ministerioreedificandooaltar/',
    facebook: 'https://www.facebook.com/PastorDoze',
    instagram: 'https://www.instagram.com/pastor_doze/',
    whatsapp: '',
  },
  email: 'contato@reedificandooaltar.com.br',
  textos: {
    convite_culto: { titulo: 'Venha adorar conosco neste domingo!', subtitulo: 'Venha fazer parte da nossa igreja!' },
    boas_vindas: {
      titulo: 'Bem-Vindos ao Ministério Reedificando o Altar!',
      paragrafos: [
        'Seja muito bem-vindo à nossa igreja. No Ministério Reedificando o Altar, acreditamos no poder transformador do amor de Deus e estamos dedicados a criar um ambiente acolhedor onde todos possam experimentar a presença divina, crescer espiritualmente e se conectar em amor e comunhão.',
        'Se você é um visitante pela primeira vez ou alguém em busca de uma igreja, convidamos você a se juntar a nós em nossos eventos e atividades. Estamos entusiasmados para compartilhar a jornada da fé contigo!',
      ],
    },
    chamado: {
      pergunta: 'Nosso chamado?',
      titulo: 'Ministério Reedificando o Altar',
      subtitulo: 'Sua Vida no Altar de Deus',
      texto:
        'É enfatizar a importância da entrega total da vida a Deus, simbolizada pelo altar. O objetivo do Ministério Reedificando o Altar é incentivar e auxiliar as pessoas a viverem uma vida íntegra, reta e com valores centrada em Deus.',
    },
    amos_9_11: {
      referencia: 'Amós 9:11',
      texto:
        'Naquele dia, restaurarei a tenda caída de Davi e consertarei seus muros quebrados. Das ruínas a reconstruirei e restaurarei sua antiga glória.',
    },
    contato_intro:
      'Tem alguma dúvida ou feedback? Não hesite em nos contatar diretamente. Nossa equipe retornará a você dentro de algumas horas para ajudar.',
  },
}
