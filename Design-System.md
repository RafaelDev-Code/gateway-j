Design System — Gateway Dashboard Vorix

Arquivos de referencia





[src/theme.js](Laravel/frontend/src/theme.js) — todas as constantes JS de cor e tipografia



[src/index.css](Laravel/frontend/src/index.css) — variaveis CSS globais + classes utilitarias



[src/App.css](Laravel/frontend/src/App.css) — reset e estilos base



[src/componentes/LayoutVorix.jsx](Laravel/frontend/src/componentes/LayoutVorix.jsx) — estrutura macro (fundo, grain, gradientes)



[src/componentes/SidebarVorix.jsx](Laravel/frontend/src/componentes/SidebarVorix.jsx) — menu lateral



[src/componentes/TopBarVorix.jsx](Laravel/frontend/src/componentes/TopBarVorix.jsx) — barra superior



[src/paginas/Dashboard.jsx](Laravel/frontend/src/paginas/Dashboard.jsx) — referencia de cards e componentes



1. Paleta de cores

Accent (vermelho)





Principal: #f30f22



Hover: #ff1a2e



Glow: rgba(243, 15, 34, 0.35)



Soft: rgba(243, 15, 34, 0.12)



Botao primario: #c41220 / hover #d41624



Borda accent: rgba(243, 15, 34, 0.25)



Highlight suave: rgba(243, 15, 34, 0.08)



Highlight forte: rgba(243, 15, 34, 0.15)

Fundos (do mais escuro ao mais claro)





Root: #060102



Elevado: #0D0204



Card: #0A0103 / #120304



Card elevado: #1A0505



Sidebar: rgba(6, 1, 2, 0.38)



TopBar: rgba(6, 1, 2, 0.35)



Card futurist: rgba(12, 2, 3, 0.28)



Card inner: rgba(255, 255, 255, 0.02)



Payment card: rgba(18, 3, 4, 0.72)

Bordas





Padrao: rgba(255, 255, 255, 0.12)



Fraca: rgba(255, 255, 255, 0.06)



Glow: rgba(255, 255, 255, 0.1)



Card: rgba(255, 255, 255, 0.07) / hover rgba(255, 255, 255, 0.10)



Inner: rgba(255, 255, 255, 0.05) / hover rgba(255, 255, 255, 0.08)

Texto





Primario: #ffffff



Muted: rgba(255, 255, 255, 0.7)



Soft: rgba(255, 255, 255, 0.5)

Status





Success: #22c55e



Warning: #eab308



Error: #ef4444



2. Tipografia





Font body: "Inter", "Lato", Arial, sans-serif



Font heading: "Lato", "Inter", Arial, sans-serif







Tamanho



Uso





10px



Labels uppercase pequenos





12px



Labels secundarios





13-14px



Texto padrao, botoes





16px



Titulos de secao





22-24px



Titulo de pagina / TopBar





34-38px



Valores monetarios principais





58px



Gauge (% grande)







Peso



Uso





500



Texto padrao





600



Subtitulos, botoes





700



Valores destacados





800-900



Gauge, nome de usuario





Letter spacing uppercase: 0.08em a 0.12em



Letter spacing valores grandes: -0.02em a -0.04em



3. Espacamento





Multiplos de 2px, de 4px a 24px



Padding interno de cards: 20px



Padding card inner: 12px 14px



Padding botoes principais: 12px 20px



Padding TopBar: 0 24px



Padding pagina: 24px



Gap entre cards: 20px



4. Border radius





6px — icones, badges



8px — botoes pequenos, tooltips



10px — cards inner, botoes medios



12px — botoes principais, sidebar buttons



14px — cards principais (card-futurist)



50% — avatares, circulos



9999px — barras de progresso



5. Sombras e brilhos

Cards

Normal: 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)
Hover:  0 8px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)

Sidebar

4px 0 20px rgba(0,0,0,0.25)

Barras/glow accent

0 0 14px rgba(243,15,34,0.3), inset 0 1px 0 rgba(255,255,255,0.15)



6. Efeito glass + grain

Toda superficie usa backdrop-filter + grain SVG:





Cards: backdrop-filter: blur(32px) + grain opacity: 0.14, background-size: 180px



Sidebar/TopBar: backdrop-filter: blur(26-28px) + grain opacity: 0.15



Card inner: backdrop-filter: blur(16px) + grain opacity: 0.12

Grain SVG padrao:

data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.9' intercept='0.05'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E



7. Gradientes de fundo do layout

O LayoutVorix empilha 7 gradientes radiais sobre #060102:





Top-left: branco suave com toque vermelho



Top-right: branco suave



Center/bottom: brancos e vermelhos em baixa opacidade



Todos sao ellipse com opacidades entre 0.03 e 0.10



8. Animacoes e transicoes

Padrao de easing





Tudo usa cubic-bezier(0.4, 0, 0.2, 1) — suave, profissional

Animacao de entrada de card

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Duracao: 0.4s, aplicar com animation-delay escalonado por card */

Animacao de entrada de pagina

@keyframes pageEnter {
  from { opacity: 0; }
  to   { opacity: 1; }
}
/* Duracao: 0.35s */

Hover de cards





transform: translateY(-2px) + sombra maior



Duracao: 0.25s

Hover de botoes





transform: translateY(-1px)



Duracao: 0.22s

Hover de sidebar items





transform: translateX(3px)



Duracao: 0.22s



9. Estrutura de layout

Layout
├── Sidebar (fixed, z-index: 9999)
│   ├── Width expanded: 260px
│   └── Width collapsed: 72px
├── TopBar (min-height: 72px)
└── Main Content
    ├── margin-left: 260px | 72px
    └── padding: 24px

Transition de colapso: width 0.2s ease, margin-left 0.2s ease

Grid do Dashboard (referencia para novas paginas)

grid-template-columns: minmax(300px, 360px) 1fr
gap: 20px
@media (max-width: 1200px): coluna unica



10. Contrato visual para novas paginas

Toda nova pagina DEVE:





Ser envolvida por <LayoutVorix> — herda fundo, sidebar, topbar



Usar animation: pageEnter 0.35s no container raiz



Usar .card-futurist (CSS class) ou os estilos inline equivalentes para cards



Cards internos usam .card-futurist-inner



Botoes primarios: background #c41220, border-radius 12px



Botoes secundarios: background rgba(255,255,255,0.06), backdropBlur 8px



Padding de pagina: 24px



Gap entre cards: 20px



Titulo de pagina: 22px, weight 700, com linha vermelha 2px solid #f30f22 abaixo (como no Dashboard)



Responsividade: breakpoints em 768px (mobile) e 1200px (tablet)



Paginas a desenvolver (ordem de prioridade)





Login.jsx — autenticacao (necessaria antes das demais)



Entradas.jsx — tabela de depositos PIX



Saidas.jsx — tabela de saques PIX



Credenciais.jsx — gerenciar API keys e IPs



Transferencia.jsx — transferencia interna



Perfil.jsx — dados pessoais, PIN, KYC



Configuracoes.jsx — postback URL, preferencias



Notificacoes.jsx — central de alertas

