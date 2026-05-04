import { spawnSync } from 'child_process';
import path from 'path';

const backendDir = path.resolve(__dirname, '..');

console.log('Iniciando configuração do banco de dados...');

// 1. Rodar migrações
console.log('\nAplicando migrações...');
const migrate = spawnSync(
  'bunx',
  ['prisma', 'migrate', 'dev', '--name', 'init'],
  {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  },
);

if (migrate.status !== 0) {
  console.error('Erro ao aplicar migrações.');
  process.exit(1);
}

// 2. Gerar o Prisma Client
console.log('\nGerando Prisma Client...');
const generate = spawnSync('bunx', ['prisma', 'generate'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

if (generate.status !== 0) {
  console.error('Erro ao gerar Prisma Client.');
  process.exit(1);
}

// 3. Rodar Seed
console.log('\n🌱 Populando banco de dados (Seed)...');
const seed = spawnSync('bun', ['run', 'prisma/seed.ts'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

if (seed.status !== 0) {
  console.error('Erro ao rodar seed.');
  process.exit(1);
}

console.log('\n Banco de dados configurado com sucesso!');
