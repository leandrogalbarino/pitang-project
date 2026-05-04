import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env';

export const dotenvConfig = dotenv.config({
  path: path.resolve(__dirname, envFile),
});
