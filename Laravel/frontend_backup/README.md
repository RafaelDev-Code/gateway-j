# Dashboard Finexa - React

Dashboard financeiro em React, tema escuro, responsivo e moderno (inspirado na referência Finexa).

## Tecnologias

- **React 19** + **Vite 7**
- **Tailwind CSS 4**
- **Recharts** (gráficos)
- **Lucide React** (ícones)

## Como rodar

```bash
cd dashboard-react
npm install
npm run dev
```

Acesse: **http://localhost:5173**

## Estrutura do projeto

```
src/
├── componentes/          # Componentes reutilizáveis
│   ├── Layout.jsx       # Layout principal (sidebar + header)
│   ├── Sidebar.jsx      # Menu lateral
│   ├── Header.jsx       # Barra superior
│   └── dashboard/       # Cards do dashboard
│       ├── CardSaldoTotal.jsx
│       ├── CardCrescimentoUsuarios.jsx
│       ├── CardAtividade.jsx
│       ├── CardDinheiroGuardado.jsx
│       ├── CardReceitaTotal.jsx
│       ├── CardEstatisticas.jsx
│       └── CardTransacoesRecentes.jsx
├── paginas/
│   └── Dashboard.jsx    # Página principal
├── App.jsx
├── main.jsx
└── index.css
```

## Build para produção

```bash
npm run build
```

Arquivos gerados em `dist/`.

## Conectar ao backend (API PHP)

Para usar dados reais do SplitPay Gateway, configure a URL da API em um arquivo de ambiente (ex: `.env`) e use `fetch` ou uma lib como Axios nos componentes de dashboard.
