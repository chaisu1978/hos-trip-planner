# Use Node.js 18 LTS for better performance and stability
FROM node:18

# Set the working directory
WORKDIR /frontend

# Set environment variable at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Command to run the development server and expose it to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
