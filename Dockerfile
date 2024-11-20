# Usa una imagen base de Node.js
FROM node:18-alpine AS builder

# Configura el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Compila la aplicación si es necesario (especialmente en NestJS)
RUN npm run build

# Define el segundo stage para reducir el tamaño de la imagen final
FROM node:18-alpine

# Configura el directorio de trabajo para el segundo stage
WORKDIR /app

# Copia solo los archivos necesarios desde el stage de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Exponer el puerto en el que tu app corre (por ejemplo, 3000 para NestJS)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "dist/main.js"]
