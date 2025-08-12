# NestJS Enterprise Template

Template empresarial com arquitetura limpa e padrões modernos, pronto para uso em projetos de qualquer escala.

## 🚀 Características

- **Arquitetura em 4 Camadas** (Application, Domain, Infrastructure, Integrations)
- **CQRS Pattern** com Commands, Queries e Events
- **Single Database** PostgreSQL otimizada
- **Background Jobs** com Bull/Redis
- **Autenticação JWT + CASL** para autorização
- **Fastify** para alta performance
- **Database Migrations** automáticas com Knex
- **WebSocket** para comunicação real-time
- **Docker** para desenvolvimento e produção

## 📁 Estrutura do Projeto

```
src/
├── application/           # Camada de Aplicação
│   ├── http/             # Controllers HTTP
│   ├── gateway/          # WebSocket Gateways
│   └── cronjobs/         # Tarefas Agendadas
├── domain/               # Camada de Domínio
│   ├── auth/             # Autenticação
│   ├── users/            # Gestão de Usuários
│   └── shared/           # Recursos Compartilhados
├── infrastructure/       # Camada de Infraestrutura
│   ├── database/         # Database & Migrations
│   ├── cache/            # Redis Cache
│   ├── configuration/    # Configurações
│   └── storage/          # Armazenamento
└── integrations/         # Integrações Externas
    ├── email/            # Serviço de Email
    └── external-apis/    # APIs Externas
```

## 🛠️ Stack Tecnológica

- **NestJS** + **Fastify**
- **PostgreSQL** + **TimescaleDB**
- **Redis** (Cache + Bull Queues)
- **Knex.js** (Migrations)
- **CQRS** Pattern
- **JWT** Authentication
- **CASL** Authorization
- **Swagger** Documentation
- **Docker** & **Docker Compose**

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Instalação

```bash
# Clone o template
git clone <template-url>
cd nest-enterprise-template

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie os serviços de dependência
npm run deps:start

# Execute as migrações
npx knex migrate:latest

# Inicie em modo desenvolvimento
npm run start:dev
```

### Comandos Essenciais

```bash
# Desenvolvimento
npm run start:dev          # Desenvolvimento com hot-reload
npm run deps:start         # Inicia dependências (PostgreSQL, Redis)

# Build & Produção
npm run build             # Build para produção
npm run start:prod        # Inicia produção

# Database
npm run m:make --name=migration_name    # Nova migration
npm run s:make --name=seed_name         # Nova seed

# Qualidade de Código
npm run lint              # ESLint
npm run format            # Prettier
```

## 📋 Recursos Incluídos

### ✅ Autenticação & Autorização
- Login JWT com refresh token
- Sistema de roles e permissões (CASL)
- Guards personalizados
- Middleware de autenticação

### ✅ Database & Migrations
- PostgreSQL com schemas múltiplos
- Migrações automáticas na inicialização
- Seeds para dados iniciais
- Repositories com padrão CQRS

### ✅ Background Jobs
- Sistema de filas com Bull/Redis
- Tracking de jobs com histórico
- Dashboard visual em `/bull`
- Retry automático com backoff

### ✅ WebSocket Real-time
- Gateway WebSocket configurado
- Autenticação em WebSocket
- Broadcast de eventos
- Decorators personalizados

### ✅ API Documentation
- Swagger/OpenAPI em `/api`
- DTOs validados automaticamente
- Exemplos de requests/responses
- Autenticação Bearer token

### ✅ Monitoring & Logging
- Morgan para logs HTTP
- Interceptors personalizados
- Health checks
- Métricas com Prometheus (opcional)

### ✅ Development Experience
- Hot-reload configurado
- Docker para desenvolvimento
- Debugging configurado
- Scripts npm otimizados

## 🏗️ Como Usar

### 1. Criar um Novo Módulo de Domínio

```bash
# Estrutura recomendada para novo módulo
src/domain/orders/
├── orders.module.ts
├── orders.service.ts
├── orders.repository.ts
├── dto/
│   ├── create-order.dto.ts
│   └── order.dto.ts
├── commands/
│   └── create-order.command.ts
├── queries/
│   └── find-orders.query.ts
└── events/
    └── order-created.event.ts
```

### 2. Implementar CQRS

```typescript
// Command Handler
@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler 
  implements ICommandHandler<CreateOrderCommand, OrderDto> {
  
  async execute(command: CreateOrderCommand): Promise<OrderDto> {
    // Lógica de criação
    this.eventBus.publish(new OrderCreatedEvent(order));
    return order;
  }
}

// Query Handler
@QueryHandler(FindOrdersQuery)
export class FindOrdersQueryHandler 
  implements IQueryHandler<FindOrdersQuery, OrderDto[]> {
  
  async execute(query: FindOrdersQuery): Promise<OrderDto[]> {
    // Lógica de busca
    return orders;
  }
}
```

### 3. Adicionar Background Job

```typescript
@Process('order-processing')
export class OrderProcessor {
  
  @Process('process-order')
  async processOrder(job: Job<ProcessOrderData>) {
    // Processamento assíncrono
    await this.orderService.processOrder(job.data);
  }
}
```

## 🐳 Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Produção
docker-compose -f docker-compose.prod.yml up
```

## 📚 Documentação Adicional

- [Guia de Desenvolvimento](docs/development.md)
- [Padrões de Código](docs/patterns.md)
- [Deploy](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.