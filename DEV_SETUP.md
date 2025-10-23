# Development Setup Guide

This project supports both local development with Vite and production deployment with Netlify.

## Local Development (Recommended for Development)

For fast, local development without Netlify CLI:

```bash
npm run dev
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Provide hot module replacement (HMR) for instant updates
- No Netlify functions available locally (but not needed for UI development)

## Netlify Local Development (Full Stack Testing)

To test the complete stack locally including serverless functions:

```bash
npm run dev:netlify
```

This will:
- Start Netlify dev server
- Make functions available at `/.netlify/functions/*`
- Allow testing API endpoints locally
- Requires Netlify CLI to be installed globally

### Install Netlify CLI (if needed)

```bash
npm install -g netlify-cli
```

## Production Build

```bash
npm run build
```

This will:
- Compile TypeScript
- Build optimized Vite bundle
- Output to `dist/` directory

## Deployment

### Deploy to Netlify

```bash
npm run netlify:deploy
```

This will:
- Trigger Netlify build (runs `netlify build`)
- Deploy to production
- Use serverless functions defined in `netlify/functions/`

## When to Use Each

| Task | Command | Why |
|------|---------|-----|
| UI Development | `npm run dev` | Fastest, no CLI needed |
| Testing API endpoints | `npm run dev:netlify` | Test full stack locally |
| Production build | `npm run build` | Prepare for deployment |
| Deploy to production | `npm run netlify:deploy` | Push to live site |

## Configuration Files

- **Local Dev**: Uses Vite config (`vite.config.ts`)
- **Production**: Uses Netlify config (`netlify.toml`)
- **Functions**: `netlify/functions/` directory
- **Environment Variables**: `.env.development` and `.env.production`

## Troubleshooting

### Port 5173 already in use
```bash
# Kill the process using port 5173 or use a different port:
VITE_PORT=3000 npm run dev
```

### Netlify CLI not found
```bash
npm install -g netlify-cli
```

### Functions not working locally
Make sure you're using `npm run dev:netlify` instead of `npm run dev`
