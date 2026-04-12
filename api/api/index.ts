import { handle } from 'hono/vercel';
import { app } from '../src/index';

export const runtime = 'nodejs';

export default handle(app);
