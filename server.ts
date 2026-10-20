import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { weatherHandler } from './api/weather';
import { geoHandler } from './api/geo';
import { forecastHandler } from './api/forecast';
import { configHandler } from './api/config';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Rota de API protegida para clima
  app.get('/api/weather', (req, res) => {
    weatherHandler(req, res);
  });

  // Rota de previsão de 5 dias
  app.get('/api/forecast', (req, res) => {
    forecastHandler(req, res);
  });

  // Rota de geocoding e autocompletar de cidades (busca inteligente de municípios)
  app.get('/api/geo', (req, res) => {
    geoHandler(req, res);
  });

  // Rota de configuração para checar se a chave existe no .env
  app.get('/api/config', (req, res) => {
    configHandler(req, res);
  });

  // Rota de status/healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!process.env.OPENWEATHER_API_KEY,
    });
  });

  if (!isProduction) {
    // Modo Desenvolvimento: Conecta os middlewares do Vite
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Modo Produção: Serve o build estático
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Servidor Clima rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
