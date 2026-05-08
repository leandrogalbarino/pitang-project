# Pitang - Projeto de Controle de Reembolsos -

Sistema robusto para controle e gestão de reembolsos, desenvolvido com foco em performance, escalabilidade e excelente experiência de usuário.

---

## Pré-requisitos

Para rodar este projeto, você precisará ter instalado em sua máquina:

- [Bun](https://bun.sh/) (Runtime e Gerenciador de Pacotes)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Para o Banco de Dados)
- [Git](https://git-scm.com/)

---

## Como Rodar o Projeto

Siga os passos abaixo para subir o ambiente de desenvolvimento:

### 1. Clonar o Repositório

```bash
git clone https://github.com/leandrogalbarino/pitang-project.git
cd pitang-project
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` seguindo o exemplo abaixo:

```env
DATABASE_URL="SEU_DATABASE_URL"
JWT_PRIVATE_KEY="SUA_CHAVE_SECRETA_AQUI"
HTTP_PORT=3000
```

### 3. Instalar Dependências

```bash
bun run install:all
```

### 4. Subir o Banco de Dados (Docker)

Certifique-se de que o Docker Desktop está aberto e rode:

```bash
docker compose up -d db
```

### 5. Inicializar e Rodar

O comando abaixo irá aplicar as migrações do banco, popular os dados iniciais (seed) e iniciar o Frontend e Backend simultaneamente:

```bash
bun run dev:init
```

### 6. Apenas Rodar

O comando abaixo apenas irá rodar o Frontend e o Backend simultaneamente.

```bash
bun run dev
```
---

## Usuários para Teste (Seed)

Após rodar o comando de inicialização, você pode acessar o sistema com os seguintes perfis:

| Perfil          | E-mail                 | Senha     |
| :-------------- | :--------------------- | :-------- |
| **Admin**       | admin@pitang.com       | pitang123 |
| **Gestor**      | gestor@pitang.com      | pitang123 |
| **Financeiro**  | financeiro@pitang.com  | pitang123 |
| **Colaborador** | colaborador@pitang.com | pitang123 |

---

## 🧪 Testes Automatizados

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.test` na pasta `backend/` seguindo o exemplo abaixo:

```env
DATABASE_URL="SEU_DATABASE_URL"
JWT_PRIVATE_KEY="SUA_CHAVE_SECRETA_AQUI"
HTTP_PORT=3001
```

### 2. Rodar todos os testes (Fullstack)

Na raiz do projeto:

```bash
bun run test:all
```

### Backend

Utiliza **Bun Test** para testes de integração de API.

````bash
cd backend
bun test:setup
bun test
````

### Frontend

Utiliza **Vitest** + **React Testing Library** para testes de componentes e RBAC.

```bash
cd frontend
bun run test
````

---

### Extras

O sistema envia uma **mensagem** para o [ntfy](https://ntfy.sh/pitang_reimbursements_notifications) sempre que uma solicitação for criada ou atualizada.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, TailwindCSS, TanStack Router, SWR, Vitest.
- **Backend**: Node.js/Bun, Express, Prisma ORM, Bun Test.
- **Infra**: Docker, PostgreSQL.
