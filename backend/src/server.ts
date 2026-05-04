import express from 'express';
import cors from 'cors';
import routes from './http/routes/index.routes';
import fallbackErrorMiddleware from './http/middlewares/fallback.middleware';
import { environment } from './core/environmentEnv';
import authMiddleware from './http/middlewares/auth.middleware';

const app = express();
const PORT = environment.HTTP_PORT;

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(authMiddleware);
app.use(routes);

app.use(fallbackErrorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;
