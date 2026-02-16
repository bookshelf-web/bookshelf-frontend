/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_ENABLE_DEVTOOLS?: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  ```
  
  ---
  
  ### 8. **src/App.tsx** (ARQUIVO GRANDE - PRINCIPAL)
  **Localização:** `bookshelf-frontend/src/App.tsx`
  
  Baixe do arquivo que compartilhei anteriormente ou copie daqui:
  - Tem ~200 linhas
  - Contém 3 páginas: Login, Register, Dashboard
  - Tem routing completo
  
  ---
  
  ## 📊 RESUMO DA ESTRUTURA
  ```
  bookshelf-frontend/
  ├── index.html              ← Criar na raiz
  ├── postcss.config.js       ← Criar na raiz
  ├── tsconfig.node.json      ← Criar na raiz
  ├── components.json         ← Criar na raiz
  ├── .env                    ← Criar na raiz
  │
  └── src/
      ├── main.tsx            ← Criar em src/
      ├── vite-env.d.ts       ← Criar em src/
      └── App.tsx             ← Criar em src/