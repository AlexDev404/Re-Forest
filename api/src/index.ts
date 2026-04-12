import { app } from './app';

const port = parseInt(process.env.PORT || '3000');

console.log(`🌱 Re-Forest API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch
};
