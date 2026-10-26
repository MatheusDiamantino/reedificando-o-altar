import { hojeIso } from './datas'

export type Versiculo = { texto: string; referencia: string }

export const VERSICULOS_DO_DIA: Versiculo[] = [
  { texto: 'O Senhor é o meu pastor; nada me faltará.', referencia: 'Salmos 23:1' },
  { texto: 'Posso todas as coisas naquele que me fortalece.', referencia: 'Filipenses 4:13' },
  {
    texto:
      'Rogo-vos, pois, irmãos, pela compaixão de Deus, que apresenteis o vosso corpo em sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional.',
    referencia: 'Romanos 12:1',
  },
  {
    texto:
      'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te esforço, e te ajudo, e te sustento com a destra da minha justiça.',
    referencia: 'Isaías 41:10',
  },
  {
    texto:
      'E os que de ti procederem edificarão as antigas ruínas; e levantarás os fundamentos de geração em geração; e chamar-te-ão reparador das roturas.',
    referencia: 'Isaías 58:12',
  },
  {
    texto: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
    referencia: 'Mateus 11:28',
  },
  {
    texto: 'Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.',
    referencia: 'Provérbios 3:5',
  },
  { texto: 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.', referencia: 'Salmos 46:1' },
  {
    texto:
      'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    referencia: 'João 3:16',
  },
  {
    texto:
      'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    referencia: 'Isaías 40:31',
  },
  {
    texto: 'Cria em mim, ó Deus, um coração puro e renova em mim um espírito reto.',
    referencia: 'Salmos 51:10',
  },
  {
    texto:
      'As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.',
    referencia: 'Lamentações 3:22-23',
  },
  { texto: 'Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.', referencia: 'Salmos 37:5' },
  {
    texto:
      'Assim que, se alguém está em Cristo, nova criatura é: as coisas velhas já passaram; eis que tudo se fez novo.',
    referencia: '2 Coríntios 5:17',
  },
  {
    texto:
      'E se o meu povo, que se chama pelo meu nome, se humilhar, e orar, e buscar a minha face, e se converter dos seus maus caminhos, então eu ouvirei dos céus, e perdoarei os seus pecados, e sararei a sua terra.',
    referencia: '2 Crônicas 7:14',
  },
  {
    texto: 'Mas buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas.',
    referencia: 'Mateus 6:33',
  },
  {
    texto: 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.',
    referencia: 'Salmos 91:1',
  },
  {
    texto: 'Eu sou o caminho, e a verdade, e a vida. Ninguém vem ao Pai senão por mim.',
    referencia: 'João 14:6',
  },
  {
    texto: 'Ora, a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem.',
    referencia: 'Hebreus 11:1',
  },
  {
    texto:
      'Elevo os meus olhos para os montes; de onde me virá o socorro? O meu socorro vem do Senhor, que fez o céu e a terra.',
    referencia: 'Salmos 121:1-2',
  },
  {
    texto:
      'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
    referencia: 'Jeremias 29:11',
  },
  { texto: 'Este é o dia que fez o Senhor; regozijemo-nos e alegremo-nos nele.', referencia: 'Salmos 118:24' },
  {
    texto: 'Portanto, não vos entristeçais, porque a alegria do Senhor é a vossa força.',
    referencia: 'Neemias 8:10',
  },
  {
    texto:
      'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados por seu decreto.',
    referencia: 'Romanos 8:28',
  },
  {
    texto: 'Provai e vede que o Senhor é bom; bem-aventurado o homem que nele confia.',
    referencia: 'Salmos 34:8',
  },
  {
    texto:
      'Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.',
    referencia: 'Josué 1:9',
  },
  {
    texto: 'Agora, pois, permanecem a fé, a esperança e o amor, estes três; mas o maior destes é o amor.',
    referencia: '1 Coríntios 13:13',
  },
  {
    texto: 'E não nos cansemos de fazer bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.',
    referencia: 'Gálatas 6:9',
  },
  {
    texto:
      'O Senhor, teu Deus, está no meio de ti, poderoso para te salvar; ele se deleitará em ti com alegria; calar-se-á por seu amor, regozijar-se-á em ti com júbilo.',
    referencia: 'Sofonias 3:17',
  },
  { texto: 'Jesus Cristo é o mesmo ontem, e hoje, e eternamente.', referencia: 'Hebreus 13:8' },
  {
    texto: 'E o fogo arderá continuamente sobre o altar; não se apagará.',
    referencia: 'Levítico 6:13',
  },
]

export const VERSICULOS_DE_ORACAO: Versiculo[] = [
  { texto: 'Orai uns pelos outros, para que sareis.', referencia: 'Tiago 5:16' },
  {
    texto: 'Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.',
    referencia: '1 Pedro 5:7',
  },
  {
    texto: 'Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e firmes, que não sabes.',
    referencia: 'Jeremias 33:3',
  },
  { texto: 'Lança o teu cuidado sobre o Senhor, e ele te susterá.', referencia: 'Salmos 55:22' },
  { texto: 'Pedi, e dar-se-vos-á; buscai e encontrareis; batei, e abrir-se-vos-á.', referencia: 'Mateus 7:7' },
  {
    texto:
      'Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplica, com ação de graças.',
    referencia: 'Filipenses 4:6',
  },
  { texto: 'Orai sem cessar.', referencia: '1 Tessalonicenses 5:17' },
]

export function doDia<T>(lista: T[], iso = hojeIso()): T {
  const dias = Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86_400_000)
  return lista[dias % lista.length]
}
