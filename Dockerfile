# Gunakan base image Node.js
FROM node:18-alpine

# Set work directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode ke dalam container
COPY . .

# Expose port (sesuaikan dengan aplikasi)
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "app.js"]
