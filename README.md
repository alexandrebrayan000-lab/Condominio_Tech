# 🏢 CondomínioTech

Plataforma completa de gestão de condomínios desenvolvida com Next.js, Prisma ORM e PostgreSQL hospedado no Neon.

🔗 **Acesse o projeto online**: [https://condominio-tech-brayan.vercel.app](https://condominio-tech-brayan.vercel.app)

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** Next.js (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS
* **ORM:** Prisma
* **Banco de Dados:** PostgreSQL (Neon Serverless)
* **Deploy:** Vercel

---

## 🚀 Funcionalidades

* 🔐 Cadastro e autenticação de moradores
* 📅 Agendamento de espaços comuns (Salão de Festas, Churrasqueira, Quadra)
* ⚡ Sincronização em tempo real com banco de dados na nuvem

---

## 🔧 Como rodar o projeto localmente

```bash
# Clone o repositório
git clone [https://github.com/SEU-USUARIO/condominio-tech-brayan.git](https://github.com/SEU-USUARIO/condominio-tech-brayan.git)

# Instale as dependências
npm install

# Configure as variáveis de ambiente (.env)
DATABASE_URL="sua-string-do-neon"

# Sincronize o banco e gere o Prisma Client
npx prisma db push
npx prisma generate

# Inicie o servidor de desenvolvimento
npm run dev










> **Aviso:** Lembre-se de trocar o link do projeto e o link do seu repositório no bloco acima pela sua URL real da Vercel e do GitHub!