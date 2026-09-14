import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createApiRouter } from './apiRoutes';
import { FigmaWebSocketBridge } from './wsBridge';
import { FigmaRestClient } from '../figma/restClient';
import { FigmaAgent } from '../agent/agent';

export function createServerApp(
  bridge: FigmaWebSocketBridge,
  restClient: FigmaRestClient,
  agent: FigmaAgent
): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));

  // Find public directory relative to cwd or __dirname
  let publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    publicDir = path.join(__dirname, '..', 'public');
  }

  app.use(express.static(publicDir));

  // Mount API router
  const apiRouter = createApiRouter(bridge, restClient, agent);
  app.use('/api', apiRouter);

  // Serve index.html for SPA routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Public index.html not found');
    }
  });

  return app;
}
