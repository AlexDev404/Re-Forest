import { getRequestListener } from '@hono/node-server';
import { app } from './app';

export default getRequestListener(app.fetch);
