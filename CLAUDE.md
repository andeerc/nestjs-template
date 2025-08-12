# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Development Workflow
```bash
# Start dependencies (PostgreSQL, Redis, pgAdmin)
npm run deps:start

# Start in development mode with hot-reload
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod

# Code quality
npm run lint
npm run format
npm run typecheck
```

### Database Management
```bash
# Create new migration
npm run m:make --name=descriptive_migration_name

# Create new seed
npm run s:make --name=descriptive_seed_name

# Manual migration commands (usually auto-executed on startup)
npx knex migrate:latest --knexfile knexfile.ts --env development
npx knex migrate:rollback --knexfile knexfile.ts --env development
npx knex seed:run --knexfile knexfile.ts --env development
```

## Architecture Overview

### Core Technology Stack
- **NestJS** with **Fastify** (not Express) as HTTP server
- **CQRS** pattern via `@nestjs/cqrs` for all business operations
- **PostgreSQL** for primary database
- **Redis** for caching and **Bull** queues
- **Knex.js** for database migrations and raw queries
- **Single-schema architecture** (no multi-tenancy)

### 4-Layer Architecture
1. **Application Layer** (`src/application/`): Controllers, WebSocket gateways, cron jobs
2. **Domain Layer** (`src/domain/`): Business logic with CQRS commands/queries/events
3. **Infrastructure Layer** (`src/infrastructure/`): Database, cache, configuration
4. **Integrations Layer** (`src/integrations/`): External services (email, APIs)

### Key Architectural Patterns

**CQRS Implementation:**
- Commands for write operations (`@CommandHandler`)
- Queries for read operations (`@QueryHandler`) 
- Events for side effects (`@EventsHandler`)
- All domain operations MUST follow CQRS pattern

**Background Jobs:**
- Bull queues with Redis backend
- Job processing in separate processors
- Real-time WebSocket notifications for job status
- Jobs automatically retry on failure

## Domain Structure

The system is organized around these main business domains:
- **Authentication & Authorization**: JWT-based auth with role checking
- **Users**: User management with CRUD operations
- **Shared Services**: Jobs and notifications

## Critical Implementation Guidelines

### Architecture Flow
The application follows a clean layered architecture:
```
Controllers → Services → CommandBus/QueryBus → Handlers → Repository
```

### CQRS Pattern Usage
**MANDATORY: NO REPOSITORY PATTERN - Use full CQRS implementation:**
- NEVER create or use repository classes
- ALL database operations MUST be implemented directly in command/query handlers
- Use Knex directly in handlers for all database operations
- Handlers contain both business logic AND database operations

```typescript
// 1. Controller calls Service
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

// 2. Service calls CommandBus/QueryBus
@Injectable()
export class UsersService {
  constructor(private readonly commandBus: CommandBus) {}
  
  async create(dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }
}

// 3. Handler contains business logic AND database operations
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(@InjectKnex() private readonly knex: Knex) {}
  
  async execute(command: CreateUserCommand): Promise<UserDto> {
    // Business logic and database operations in handler
    const hashedPassword = await bcrypt.hash(command.createUserDto.password, 10);
    const [user] = await this.knex('users')
      .insert({ ...command.createUserDto, password: hashedPassword })
      .returning('*');
    return this.mapToDto(user);
  }
}
```

### Database Operations
- Database migrations auto-execute on app startup
- Case conversion: snake_case DB ↔ camelCase TypeScript
- Knex migrations in `src/infrastructure/database/migrations/`
- Seeds in `src/infrastructure/database/seeds/`

### API Development
- Controllers in `src/application/http/controllers/`
- Use `@Public()` decorator for public endpoints (no auth required)
- Swagger documentation available at `/api`
- DTOs for request/response validation required
- Bull queue dashboard at `/bull`

### Background Jobs
- Use JobsService for queueing jobs
- Jobs processed in separate processor classes
- WebSocket notifications for real-time status updates
- Heavy operations should be moved to background jobs

### Configuration Management
- Environment variables validated with Joi
- Configuration centralized in `src/infrastructure/configuration/`
- Use ConfigurationService to access config values
- Multi-environment support (development, staging, production)

## File Organization Conventions
- Use barrel exports (`index.ts`) for clean imports
- Feature-based modules with commands/queries/events
- kebab-case for file names, PascalCase for classes
- DTOs required for all API contracts
- Path aliases configured: `@/` maps to `src/`

## External Integrations
- **Email**: Background job-based email sending
- **WebSockets**: Real-time communication
- **Redis**: Caching and job queues
- Ready for: AWS, file storage, external APIs

## Development Environment
- Migrations and seeds execute automatically on startup
- Use `docker-compose.dev.yml` for local dependencies
- PostgreSQL (port 5432), Redis (port 6379), pgAdmin (port 5050)
- Hot-reload enabled in development mode
- Health check endpoint at `/health`

## Testing
- Jest configuration included
- Use `npm run test` for unit tests
- Use `npm run test:e2e` for end-to-end tests
- Test files should be `*.spec.ts` or `*.test.ts`

## Production Deployment
- Docker multi-stage build configured
- Use `docker-compose.prod.yml` for production
- Environment variables must be configured
- Automatic health checks included
- Logs to `/app/logs` in container