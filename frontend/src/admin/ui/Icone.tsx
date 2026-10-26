const CAMINHOS = {
  painel: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  live: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  agenda: 'M4 6h16v14H4zM4 10h16M8 3v5M16 3v5',
  mensagem: 'M4 5h16v11H8l-4 4z',
  conteudo: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  usuarios: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 0 1 0 7M22 21c0-3-2-5-4-5.5',
  externo: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  sair: 'M15 4h5v16h-5M10 8l-4 4 4 4M6 12h11',
  mais: 'M12 5v14M5 12h14',
  lixo: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  lapis: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  repete: 'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5',
  imagem: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01',
}

export type NomeIcone = keyof typeof CAMINHOS

export function Icone({ nome, className = 'size-5' }: { nome: NomeIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={CAMINHOS[nome]} />
    </svg>
  )
}
