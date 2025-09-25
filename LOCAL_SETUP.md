# Surakshabot - Local Development Setup

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Run the Application**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:8000/api

## What Changed

✅ **Removed:**
- Netlify configuration (`netlify.toml`)
- Netlify headers and redirects (`_headers`, `_redirects`)
- Render deployment configurations
- SendGrid configurations (none found)

✅ **Updated:**
- Port changed from 8001 to 8000
- CORS configured for localhost:8000
- Backend URL references updated
- Added concurrently dependency for running both frontend and backend

## Development Commands

- `npm run dev` - Run both frontend and backend
- `npm run dev:client` - Run only frontend (Vite)
- `npm run dev:server` - Run only backend (Node.js)
- `npm run build` - Build for production

## Environment Variables

The `.env` file contains all necessary configurations for local development. No additional setup required.

## Notes

- Both frontend and backend now run on the same port (8000) with different endpoints
- The application is fully configured for local development
- All deployment-specific configurations have been removed