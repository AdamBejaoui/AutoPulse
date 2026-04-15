# Use the official Microsoft Playwright image as the base
# This image comes pre-installed with all necessary system libraries for Chromium, Firefox, and WebKit
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# We use 'npm ci' for faster, more reliable builds in CI/CD
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Final check: Ensure Playwright browsers are installed (though they are in the base image, this is a safety check)
RUN npx playwright install chromium

# The command to start the background worker process
# This uses the 'workers' script defined in package.json
CMD ["npm", "run", "workers"]
