# Базовый образ Node.js
FROM node:22-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем весь проект
COPY . .

# Открываем порт (например, 3001 для API)
EXPOSE 3001

# Команда запуска
CMD ["node", "src/index.js"]
