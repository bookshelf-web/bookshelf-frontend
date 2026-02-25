# Usando Node 22 para compatibilidade com Vite 7+
FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de manifesto do Yarn
COPY package.json yarn.lock* ./

# Instala as dependências usando Yarn
RUN yarn install

# Copia o resto dos arquivos do projeto
COPY . .

# Expõe a porta padrão do Vite
EXPOSE 5173

# Comando para rodar o modo dev aceitando conexões externas
CMD ["yarn", "dev", "--host"]