# Pitang Reimbursement Control

Sistema Fullstack para controle e gestão de reembolsos, desenvolvido para o desafio técnico da Pitang.

## Tecnologias Utilizadas

### Backend

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: Express.js (TypeScript)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Token)
- **Validação**: Zod
- **Uploads**: Multer (Armazenamento local em disco)

### Frontend

- **Framework**: React + Vite (TypeScript)
- **Estilização**: TailwindCSS + Shadcn/UI
- **Gerenciamento de Estado**: Context API + SWR (Fetching & Caching)
- **Roteamento**: React Router
- **Formulários**: React Hook Form + Zod

## Pré-requisitos

- [Bun](https://bun.sh/) instalado (v1.0+)
- Docker (opcional, para o banco de dados) ou PostgreSQL local

## Como Rodar

### 1. Configuração Inicial

Na raiz do projeto, instale as dependências e configure o banco:

```bash
# Instalar dependências
bun install

# Configurar banco de dados e rodar seeds
bun run dev:init
```

### 2. Rodar o Projeto

```bash
bun run dev
```

O backend rodará em `http://localhost:3000` e o frontend em `http://localhost:5173`.

---

## Testes

### Backend (Jest + Supertest)

```bash
cd backend
bun run test
```

### Frontend (Vitest + RTL)

```bash
cd frontend
bun run test run
```

---

## Perfis de Acesso (Dados do Seed)

| Perfil          | E-mail             | Senha      | Permissões                      |
| :-------------- | :----------------- | :--------- | :------------------------------ |
| **Admin**       | admin@pitang.com   | admin123   | Gestão de categorias e usuários |
| **Colaborador** | colab@pitang.com   | colab123   | Cria e envia reembolsos         |
| **Gestor**      | gestor@pitang.com  | gestor123  | Aprova ou Rejeita solicitações  |
| **Financeiro**  | finance@pitang.com | finance123 | Marca solicitações como pagas   |

---

## Estrutura de Pastas

- `/backend`: Servidor Express, Prisma Schema e Logica de Negócios.
- `backend/src/uploads`: Pasta local onde são salvos os comprovantes (Backend).
- `/frontend`: Aplicação React, Componentes Shadcn e Hooks.

---

Desenvolvido por **Leandro Galbarino**.
