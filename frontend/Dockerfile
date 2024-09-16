# Use a Node.js base image
FROM node:18



# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the frontend code
COPY . .

# Build the frontend
RUN npm run build

# Serve the built frontend
RUN npm install -g serve
CMD ["serve", "-s", "dist"]

# Expose the port the app runs on
EXPOSE 5000
