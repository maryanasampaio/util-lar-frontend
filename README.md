# Util Lar

Sistema de gerenciamento de e-commerce para móveis e eletrodomésticos.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router v6** - Roteamento
- **Tailwind CSS v3** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

## 📁 Arquitetura

Projeto organizado em **MVVM (Model-View-ViewModel)** por features:

```
src/
├── core/              # Configuração central (App, Router)
├── features/          # Features por domínio (products, admin, favorites)
│   └── [feature]/
│       ├── model/     # Tipos e dados
│       ├── repository/ # Persistência (localStorage)
│       ├── viewmodel/ # Lógica e estado (Context API)
│       └── view/      # Componentes e páginas
└── shared/            # Código compartilhado
    ├── components/    # Componentes reutilizáveis
    ├── ui/           # Componentes base de UI
    ├── layouts/      # Layouts
    └── utils/        # Utilitários
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm 8+

### Instalação

```bash
pnpm install
```

### Executar em desenvolvimento

```bash
pnpm dev
```

Acesse em `http://localhost:3000`

### Build para produção

```bash
pnpm build
```

### Preview da build

```bash
pnpm preview
```

## 🎨 Features

- ✅ Catálogo de produtos com filtros avançados
- ✅ Sistema de favoritos
- ✅ Painel administrativo
- ✅ Gerenciamento de produtos (CRUD)
- ✅ Marcação de vendas
- ✅ Simulações financeiras
- ✅ Tema claro/escuro
- ✅ Design responsivo

## 🔐 Acesso Admin

Para acessar o painel administrativo:
- Duplo clique na ilustração SVG do banner principal
- Senha padrão: `123456`

## 📦 Persistência

Os dados são armazenados localmente usando:
- `localStorage` - Produtos, vendas, favoritos
- `sessionStorage` - Sessão administrativa
