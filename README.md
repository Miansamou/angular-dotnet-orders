# Orders — .NET 9 + Angular

Monorepo com API (.NET 9) e SPA (Angular). Persistência em PostgreSQL (Docker), autenticação com JWT, CRUD de Products, cadastro/login de usuários.

* Backend: ASP.NET Core 9, EF Core 9, Npgsql, BCrypt
* Frontend: Angular 18 (CSR), Vite dev-server, HTTP Interceptor (Bearer)
* Banco de dados: PostgreSQL 16 (Docker)

## Pré-requisitos

* Windows + Docker Desktop (WSL2)
* .NET SDK 9
* Node.js LTS + Angular CLI

### Docker - expõe Postgres em localhost:5433
~~~
docker compose up -d
~~~

### Backend

#### Compilar
~~~
cd api/
dotnet restore
dotnet build
~~~

#### Configurar User-Secret
~~~
cd src/Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<CHAVE-ALEATORIA-32+>" #exemplo de chave: DEV-ONLY-CHANGE-ME-32CHARS-_xxxxxxxxxxxxxxxx
~~~

#### Migration
~~~
cd ..; cd ..
dotnet ef migrations add Initial --project src/Infrastructure --context AppDbContext
dotnet ef database update --project src/Infrastructure context AppDbContext
~~~

#### Rodar API - Porta 5018
~~~
dotnet run --project src/Api
~~~

### Endpoints
~~~
POST /users          { "name":"Exemplo", "email":"exemplo@email.com", "password":"Senha#123" }
POST /auth/login     { "email":"exemplo@email.com", "password":"Senha#123" }                     -> Retorna o Bearer Token
GET  /products                                                                                   -> Requer autorização via Bearer Token
POST /products       { "name":"Produto", "price": 10.5 }                                         -> Requer autorização via Bearer Token
~~~

### Frontend

#### Instalar dependências
~~~
cd ..; cd /client
npm ci
~~~

#### Rodar - Porta 4200
~~~
npm start
~~~

