# Rinha de Backend - 2024/Q1

## Visão Geral

Este repositório oferece uma solução para o desafio da Rinha de Backend do 2024/Q1. Desde o início, meu objetivo foi criar uma solução escalável e de fácil manutenção, disponibilizando o material para servir como referência de estudo e/ou base para futuros projetos na comunidade.

Aqui estão algumas das principais características da solução:

- **Arquitetura Hexagonal**: Organiza a aplicação em camadas independentes
- **Providers**: Encapsula bibliotecas e serviços externos
- **Repositories**: Gerencia acesso e persistência de dados
- **Mappers**: Mapeia dados entre diferentes camadas da aplicação
- **Either Monad**: Manipula erros de forma funcional
- **The Common-Closure Principle (CCP)**: Agrupa componentes que mudam juntos
- **Inversão de Dependência**: Desacopla componentes de alto nível dos componentes de baixo nível
- **Testes Unitários**: Testes de componentes individuais para garantir que funcionem corretamente
- **Testes de Integração**: Testes de integração para garantir que os componentes funcionem juntos corretamente
- **Test Data Builder**: Constrói dados de teste para testes unitários e de integração

## Instalação

Para instalar e configurar o projeto, siga estes passos:

1. Clone o repositório para sua máquina local.
2. Navegue até o diretório do projeto.
3. Instale as dependências:

   ```bash
   bun install
   ```

## Uso

Para usar o projeto, siga estes passos:

Você precisa configurar as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```env
POSTGRES_PASSWORD=123
DATABASE_URL=postgres://admin:${POSTGRES_PASSWORD}@db:5432/rinha
```

Para executar o projeto, execute o seguinte comando:

```bash
docker-compose up -f docker-compose.dev.yml
```

## Testes

Para executar os testes, você precisa configurar as variáveis de ambiente. Crie um arquivo `.env.test` na raiz do projeto e adicione as seguintes variáveis:

```env
POSTGRES_PASSWORD=123
DATABASE_URL=postgres://admin:${POSTGRES_PASSWORD}@localhost:5433/rinha-test
```

Certifique-se de que você já rodou o comando `docker-compose up -f docker-compose.dev.yml` para subir o banco de dados.

Em seguida, execute o seguinte comando:

```bash
bun test
```

## Diagramas

### Infraestrutura

```mermaid
graph TD;
    Cliente-->Nginx;
    Nginx-->API01;
    Nginx-->API02;
    API01-->Postgres;
    API02-->Postgres;
```

### Casos de Uso

#### Extrato

```mermaid
sequenceDiagram
    participant Cliente
    participant Nginx
    participant API
    participant Postgres
    participant Postgres
    
    Cliente->>Nginx: Enviar requisição
    Nginx->>API: Encaminhar requisição
    API->>Postgres: Consultar dados do cliente
    Postgres-->>API: Dados do cliente
    API->>Postgres: Consultar saldo do cliente
    API->>Postgres: Consultar últimas 10 transações do cliente
```

#### Transferência - Débito

```mermaid
sequenceDiagram
    participant Cliente
    participant Nginx
    participant API
    participant Postgres
    participant Worker

    Cliente->>Nginx: Enviar requisição
    Nginx->>API: Encaminhar requisição
    API->>Postgres: Remover saldo do cliente
    API->>Postgres: Adicionar transação no relacional
    Note over API: Conclui processamento<br/>da requisição
```

#### Transferência - Crédito

```mermaid
sequenceDiagram
    participant Cliente
    participant Nginx
    participant API
    participant Postgres

    Cliente->>Nginx: Enviar requisição
    Nginx->>API: Encaminhar requisição
    API->>Postgres: Adicionar saldo do cliente
    API->>Postgres: Adicionar transação no relacional
    Note over API: Conclui processamento da requisição
```

## Licença

Este projeto está licenciado sob a Licença MIT.
