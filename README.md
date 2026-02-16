<div align="center">
  <h1>📚 BookShelf Frontend</h1>
  <p><strong>Sistema de Gerenciamento de Biblioteca Pessoal</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18.2-blue?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Playwright-1.40-2EAD33?logo=playwright" alt="Playwright" />
    <img src="https://img.shields.io/badge/WCAG-2.1_AA-green" alt="WCAG 2.1 AA" />
  </p>

  <p>
    Interface moderna e acessível para organizar sua biblioteca pessoal. 
    Desenvolvido com foco em qualidade, testes automatizados e acessibilidade.
  </p>

  <p>
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-instalação">Instalação</a> •
    <a href="#-testes">Testes</a> •
    <a href="#-acessibilidade">Acessibilidade</a>
  </p>
</div>

---

## 📸 Screenshots

### Tela de Login
![Login](https://via.placeholder.com/800x400/6366f1/ffffff?text=Tela+de+Login)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/a855f7/ffffff?text=Dashboard)

### Modal de Adicionar Livro
![Modal](https://via.placeholder.com/800x400/ec4899/ffffff?text=Modal+Adicionar+Livro)

> 💡 **Dica:** Substitua os placeholders por screenshots reais do seu projeto!

---

## ✨ Funcionalidades

### Implementadas ✅

- 🔐 **Autenticação JWT**
  - Login seguro com validação
  - Registro de novos usuários
  - Proteção de rotas privadas
  - Logout com limpeza de sessão

- 📊 **Dashboard Interativo**
  - Estatísticas de leitura (Total, Para Ler, Lendo, Concluídos)
  - Cards informativos com animações
  - Layout responsivo

- 📖 **Gerenciamento de Livros**
  - Modal completo para adicionar livros
  - Formulário com validação
  - Campos: Título, Autor, ISBN, Editora, Ano, Páginas, Idioma, Descrição

- 🎨 **UI/UX Moderna**
  - Design glassmorphism
  - Gradientes suaves e animações
  - Tema consistente e profissional
  - Totalmente responsivo (mobile-first)

- ♿ **Acessibilidade WCAG 2.1 AA**
  - Navegação completa por teclado
  - ARIA labels em todos os elementos
  - Screen reader friendly
  - Contrast ratios adequados

### Em Desenvolvimento 🚧

- 📚 Lista de livros com paginação
- 🔍 Busca e filtros avançados
- ⭐ Sistema de avaliações
- 📝 Notas pessoais
- 📈 Estatísticas reais da API
- 🌙 Modo escuro

---

## 🛠️ Tecnologias

### Core

- **[React 18](https://react.dev/)** - Framework UI
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool ultra rápido
- **[React Router v6](https://reactrouter.com/)** - Roteamento

### UI/UX

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes acessíveis
- **[Radix UI](https://www.radix-ui.com/)** - Primitivos acessíveis (WCAG 2.1)
- **[Lucide React](https://lucide.dev/)** - Ícones modernos

### Estado & Data

- **[TanStack Query](https://tanstack.com/query)** - Server state management
- **[Axios](https://axios-http.com/)** - HTTP client
- **[React Hook Form](https://react-hook-form.com/)** - Formulários performáticos
- **[Zod](https://zod.dev/)** - Validação de schemas

### Testes & Qualidade

- **[Playwright](https://playwright.dev/)** - Testes E2E
- **[axe-core](https://github.com/dequelabs/axe-core)** - Testes de acessibilidade
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[TypeScript ESLint](https://typescript-eslint.io/)** - Code quality

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- [BookShelf API](https://github.com/seu-usuario/bookshelf-api) rodando

### Setup
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/bookshelf-frontend.git
cd bookshelf-frontend

# 2. Instale as dependências
npm install --legacy-peer-deps

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Edite o .env com suas configurações
# VITE_API_URL=http://localhost:3000/api

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📋 Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev              # Servidor dev (localhost:5173)
npm run build            # Build para produção
npm run preview          # Preview do build

# Testes
npm test                 # Testes unitários (Vitest)
npm run test:e2e         # Testes E2E (Playwright)
npm run test:e2e:ui      # Testes E2E com interface visual
npm run test:a11y        # Testes de acessibilidade

# Code Quality
npm run lint             # ESLint
```

---

## 🧪 Testes

### Testes End-to-End (Playwright)

O projeto possui testes E2E completos cobrindo:

- ✅ Autenticação (Login/Logout/Registro)
- ✅ Navegação entre páginas
- ✅ Formulários e validações
- ✅ Modal de adicionar livros
- ✅ Responsividade (desktop e mobile)
```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar em modo interativo
npm run test:e2e:ui

# Rodar em navegador específico
npx playwright test --project=chromium
```

### Testes de Acessibilidade

Todos os testes incluem verificações automáticas de **WCAG 2.1 Level AA**:
```bash
# Testes marcados com @a11y
npm run test:a11y
```

**O que é validado:**
- ✅ ARIA labels e roles
- ✅ Navegação por teclado
- ✅ Contrast ratios
- ✅ Alt text em imagens
- ✅ Form labels apropriados
- ✅ Focus indicators

### Data Test IDs

Todos os elementos interativos possuem `data-testid` para facilitar automação:
```typescript
// Exemplos
'email-input'
'password-input'
'login-button'
'register-button'
'add-book-button'
'book-card-{id}'
'stats-total'
// ... e muitos outros
```

---

## ♿ Acessibilidade

Este projeto foi desenvolvido seguindo as diretrizes **WCAG 2.1 Level AA**.

### Recursos Implementados

- ✅ **Navegação por teclado** completa
- ✅ **ARIA labels** em todos os elementos interativos
- ✅ **Screen reader** friendly (testado com NVDA/VoiceOver)
- ✅ **Contrast ratios** adequados (mínimo 4.5:1)
- ✅ **Focus indicators** visíveis
- ✅ **Skip links** para navegação rápida
- ✅ **Semantic HTML** (main, nav, article, section)
- ✅ **Alt text** em todas as imagens
- ✅ **Form labels** associados corretamente
- ✅ Suporte a **prefers-reduced-motion**
- ✅ Suporte a **prefers-contrast**

### Testando Acessibilidade
```bash
# Testes automáticos
npm run test:a11y

# Teste manual com screen reader
# macOS: VoiceOver (Cmd + F5)
# Windows: NVDA (gratuito - https://www.nvaccess.org/)
```

---

## 🎨 Estrutura do Projeto
```
bookshelf-frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   │   └── button.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx  # Context de autenticação
│   ├── services/
│   │   ├── api.ts           # Configuração Axios
│   │   ├── auth.service.ts  # Serviços de auth
│   │   └── books.service.ts # Serviços de livros
│   ├── types/
│   │   ├── auth.ts          # Types de autenticação
│   │   └── book.ts          # Types de livros
│   ├── lib/
│   │   └── utils.ts         # Utilities
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── tests/
│   └── e2e/
│       └── example.spec.ts  # Testes E2E
├── public/
├── .env.example
├── playwright.config.ts
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🔐 Variáveis de Ambiente
```env
# .env
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_DEVTOOLS=true
```

⚠️ **Importante:** Variáveis devem começar com `VITE_` para serem expostas no cliente.

---

## 🌐 Deploy

### Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente no dashboard
# VITE_API_URL=https://sua-api.com/api
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

### GitHub Pages
```bash
# Instalar gh-pages
npm install -D gh-pages

# Adicionar no package.json
"homepage": "https://seu-usuario.github.io/bookshelf-frontend",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

---

## 🐛 Troubleshooting

### API não conecta
```bash
# Verificar se a API está rodando
curl http://localhost:3000/api/health

# Verificar variável de ambiente
echo $VITE_API_URL
```

### Erro de CORS

Configure CORS na API para aceitar `http://localhost:5173`:
```typescript
// Backend: src/app.ts
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### Testes E2E falhando
```bash
# Instalar browsers do Playwright
npx playwright install

# Verificar se o servidor está rodando
npm run dev
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrão de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: nova funcionalidade
fix: correção de bug
docs: alterações na documentação
style: formatação, sem mudança de código
refactor: refatoração de código
test: adição ou correção de testes
chore: atualizações de build, configs, etc
```

---

## 📚 Recursos e Documentação

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Thiago Rocha**

- GitHub: [@thiago8rocha](https://github.com/thiago8rocha)
- LinkedIn: [Seu LinkedIn](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- [shadcn](https://twitter.com/shadcn) pelos componentes incríveis
- [Radix UI](https://www.radix-ui.com/) pela base acessível
- [Vercel](https://vercel.com/) pelo Vite
- Comunidade React pela inspiração

---

## 🎯 Roadmap

- [x] Autenticação JWT
- [x] Dashboard básico
- [x] Modal de adicionar livro
- [x] Testes E2E
- [x] Testes de acessibilidade
- [ ] CRUD completo de livros
- [ ] Busca e filtros avançados
- [ ] Sistema de avaliações
- [ ] Dashboard com dados reais da API
- [ ] PWA (Progressive Web App)
- [ ] Modo escuro
- [ ] Internacionalização (i18n)
- [ ] Integração com Google Books API

---

<div align="center">
  <p>Feito com ❤️ e ☕ por <a href="https://github.com/thiago8rocha">Thiago Rocha</a></p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>