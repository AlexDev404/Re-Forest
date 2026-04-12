import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as relations from './relations';
import * as schema from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const client = neon(process.env.DATABASE_URL);

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...relations
  }
});
