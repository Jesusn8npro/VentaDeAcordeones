FROM node:22-alpine

# Dependencias del sistema para @whiskeysockets/baileys
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY . .

# Directorio para guardar la sesión de WhatsApp (montar como volumen en EasyPanel)
RUN mkdir -p /app/auth

CMD ["node", "index.js"]
