# Pitang Reimbursement Control - Backend

Este é o backend da aplicação de **Controle de Solicitações de Reembolso**, desenvolvida como parte do desafio técnico da Pitang. A aplicação segue as regras de negócio para fluxos de aprovação, perfis de acesso (RBAC) e auditoria.

## 🛠️ Tecnologias Utilizadas

- **Runtime**: [Bun](https://bun.sh/) (Fast JS runtime)
- **Framework**: Express.js com TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Validação**: Zod
- **Autenticação**: JWT (JSON Web Token)
- **Manipulação de Datas**: DayJS
- **Testes**: Jest & Supertest
- **Storage**: Cloudinary (opcional) ou Local

---

## 📋 Pré-requisitos

1. **PostgreSQL** rodando localmente (ou via Docker).
2. **Bun** instalado (`powershell -c "irm bun.sh/install.ps1 | iex"` no Windows).

---

## ⚙️ Configuração e Execução

### 1. Instalar dependências
```bash
bun install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:
```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/pitang_project?schema=public"
JWT_PRIVATE_KEY="uma_chave_secreta_muito_forte"
HTTP_PORT=3000
```

### 3. Preparar o Banco de Dados
Para criar o banco e as tabelas automaticamente:
```bash
bun run db:setup
```

Para popular o banco com dados iniciais (usuários e categorias):
```bash
bunx prisma db seed
```

### 4. Executar o Servidor
```bash
bun run dev # ou bun ./src/server.ts
```
O servidor estará rodando em `http://localhost:3000`.

---

## 🧪 Testes

Os testes são executados em um banco de dados **isolado** (`pitang_test`) para não afetar seus dados de desenvolvimento.

1. **Configurar banco de teste**:
```bash
bun run test:setup
```

2. **Rodar os testes**:
```bash
bun test
```

---

## ⚖️ Relatório de Implementação (vs Desafio)

Com base no documento `desafio-estags-pitang.html`, aqui está o status atual do backend:

### ✅ Implementado (Requisitos Básicos)
- **Autenticação**: Login com JWT e proteção de rotas privadas.
- **RBAC (Perfis)**: Middleware que valida permissões para `COLABORADOR`, `GESTOR`, `FINANCEIRO` e `ADMIN`.
- **Fluxo de Status**: Transições de status: `RASCUNHO` -> `ENVIADO` -> `APROVADO`/`REJEITADO` -> `PAGO`.
- **Auditoria**: Toda ação gera um registro na tabela `RequestHistory` (quem, o quê, quando e observação).
- **Validações**: Todas as entradas (body/params) são validadas com Zod (valor > 0, justificativa obrigatória ao rejeitar, etc).
- **Anexos**: Suporte a múltiplos anexos por solicitação, com integração local ou Cloudinary.
- **CRUD Categorias**: Admin pode criar, editar e (in)ativar categorias.
- **Filtros por Perfil**: Listagem inteligente (Colaborador vê as suas, Gestor vê enviadas, Financeiro vê aprovadas).
- **Paginação**
- **Soft Delete**: Exclusão lógica para categorias e usuários.

### ⏳ Pendente / Diferenciais (Extras)
- **Dashboard**: Endpoints específicos para estatísticas (totais por categoria/status).
---

## 👤 Usuários de Teste (Seed)

Após rodar o comando `seed`, você pode usar as seguintes credenciais (senha padrão: `pitang123`):

| Perfil | E-mail |
| :--- | :--- |
| **Admin** | `admin@pitang.com` |
| **Gestor** | `gestor@pitang.com` |
| **Financeiro** | `financeiro@pitang.com` |
| **Colaborador** | `colaborador@pitang.com` |

---

## 🛠️ Scripts Úteis

- `bun run db:setup`: Cria o banco principal e sincroniza o schema.
- `bun run test:setup`: Cria o banco de teste isolado.
- `bunx prisma studio`: Interface visual para navegar no banco de dados.
