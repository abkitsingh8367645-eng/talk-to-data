# Text-to-SQL Analytics Chatbot

## Overview

This is a full-stack application that provides an intelligent text-to-SQL chatbot for manufacturing analytics. The system is designed for "Bhaiya & Company," an aluminum foil manufacturing company, and supports three types of analytics:

1. **Descriptive Analytics** - Historical data analysis ("What happened?")
2. **Diagnostic Analytics** - Root cause analysis ("Why did it happen?")  
3. **Prescriptive Analytics** - Recommendations and action plans ("What should we do?")

The application features a multi-agent architecture with real-time WebSocket communication, interactive charts, and a modern React frontend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket API for agent interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **WebSocket**: Built-in WebSocket server for real-time agent communication
- **Data Storage**: In-memory storage with interfaces for future database integration
- **Build System**: ESBuild for production bundling

### Database Architecture
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Manufacturing-focused tables including production data, maintenance logs, and chat sessions
- **Migration**: Drizzle Kit for schema management
- **Provider**: Neon Database serverless PostgreSQL (configured but using in-memory storage for development)

## Key Components

### Multi-Agent System
The application implements a sophisticated agent architecture:

1. **User Proxy Agent** - Handles user interactions and tool execution
2. **Orchestrator Agent** - Routes queries to appropriate analytics workflows
3. **Descriptive Agent** - Generates and executes SQL queries with error handling
4. **Diagnostic Agent** - Performs root cause analysis
5. **Prescriptive Agent** - Provides recommendations and action plans
6. **Response Generation** - Creates user-friendly final responses

### Real-time Communication
- WebSocket server handles agent workflow steps
- Live agent thinking display with status updates
- Streaming response generation
- Connection management with automatic reconnection

### Data Visualization
- Chart.js integration for production analytics
- Interactive charts with trend analysis
- Responsive design for mobile and desktop
- Export capabilities for reports

### Chat Interface
- Pre-defined sample queries for each analytics type
- Real-time typing indicators and agent status
- Message history with session management
- "Begin new chat" functionality

## Data Flow

1. **User Query Processing**
   - User submits query through chat interface
   - WebSocket connection established for real-time updates
   - Query classified by type (descriptive/diagnostic/prescriptive)

2. **Agent Workflow**
   - Orchestrator agent analyzes query intent
   - Appropriate specialist agent activated
   - SQL query generation and execution
   - Data processing and analysis

3. **Response Generation**
   - Results formatted for display
   - Charts generated when applicable
   - Insights and recommendations provided
   - Response streamed to user interface

4. **Session Management**
   - Chat sessions stored with unique identifiers
   - Message history maintained per session
   - Agent interactions logged for debugging

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **UI Components**: @radix-ui/* for accessible component primitives
- **Charts**: chart.js for data visualization
- **WebSocket**: Built-in ws library for real-time communication

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server with HMR
- **ESBuild**: Production bundling for server code
- **Tailwind CSS**: Utility-first CSS framework

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit**: Development environment with integrated tools

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend auto-restart
- **Database**: `npm run db:push` for schema synchronization

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code with external dependencies
- **Database**: Production PostgreSQL with connection pooling

### Environment Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Process**: Automated build pipeline with type checking
- **Asset Serving**: Static file serving in production mode

### Scalability Considerations
- **WebSocket Connections**: Designed for horizontal scaling
- **Database Queries**: Optimized for manufacturing data patterns
- **Caching**: Query result caching for frequently accessed data
- **Session Management**: Stateless design for load balancing

The application is designed to be easily extensible, with clear separation between agent types and support for adding new analytics capabilities. The modular architecture allows for independent scaling of different components based on usage patterns.