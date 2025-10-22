#!/usr/bin/env node

import { startKoaServer } from './koa.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

startKoaServer(port);
