import app from './app.js';

const port = Number(process.env.API_PORT || 3001);

if (process.env.VERCEL !== '1') {
  app.listen(port, '127.0.0.1', () => {
    console.log(`Terra Zone API running at http://127.0.0.1:${port}`);
  });
}
