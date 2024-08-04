# Establecer la imagen base con Node.js
FROM node:lts-alpine

RUN apk add --no-cache python3 make g++

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de configuración de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos al directorio de trabajo
COPY . .

# Exponer el puerto que utiliza el backend
EXPOSE 3000

# Comando para iniciar la aplicación en modo de desarrollo
CMD ["node", "index.js"]
