import { Client } from 'pg';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env.test explicitamente com override: true
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
});

const dbUrl = process.env.DATABASE_URL;
console.log(`🔍 DATABASE_URL carregada: ${dbUrl}`);

if (!dbUrl) {
  console.error('DATABASE_URL não encontrada no .env.test');
  process.exit(1);
}

// Extrair o nome do banco da URL
const dbNameMatch = dbUrl.match(/\/([^/?]+)(\?|$)/);
if (!dbNameMatch) {
  console.error(
    'Não foi possível extrair o nome do banco de dados da DATABASE_URL',
  );
  process.exit(1);
}
const dbName = dbNameMatch[1];

async function setup() {
  console.log(`🚀 Iniciando configuração do banco de teste: ${dbName}`);

  // Conectar ao banco 'postgres' padrão para criar o novo banco
  // Removemos o nome do banco da URL para conectar ao admin
  const postgresUrl = dbUrl.replace(`/${dbName}`, '/postgres');
  const client = new Client({ connectionString: postgresUrl });

  try {
    await client.connect();

    // Verificar se o banco existe
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName],
    );

    if (res.rowCount === 0) {
      console.log(`🔨 Criando banco de dados: ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`Banco de dados ${dbName} já existe.`);
    }
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL para criar o banco:', err);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Rodar o prisma db push
  console.log(
    '🔄 Sincronizando schema com o banco de teste (prisma db push)...',
  );
  try {
    // Usamos bunx para garantir que use o prisma local
    execSync('bunx prisma db push', {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
    });
    console.log('Ambiente de teste configurado com sucesso!');
  } catch (err) {
    console.error('Erro ao rodar prisma db push:', err);
    process.exit(1);
  }
}

setup();
