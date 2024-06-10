# Establecer la imagen base con Node.js
FROM node:lts-alpine as development

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de configuración de paquetes
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos al directorio de trabajo
COPY . .

# Exponer el puerto que utiliza Vite
EXPOSE 8080

# Comando para iniciar la aplicación en modo de desarrollo
CMD ["npm", "run", "dev"]