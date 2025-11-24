<div align="center" width="200px">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="public/title.white.png">
   <source media="(prefers-color-scheme: light)" srcset="public/title.black.png">
   <img width="200" alt="logo" src="public/title.white.png">
 </picture>
</div>

<div align="center">
  <strong>Tracktrip is a mobile and web application to record and budget your travel expenses, solo or with your friends.</strong>
</div>

<br />

<div align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#database-schema">Database Schema</a> •
  <a href="#authentication">Authentication</a> •
  <a href="#development">Development</a> •
  <a href="#deployment">Deployment</a>
</div>

<br />

## Features

Tracktrip is a comprehensive travel budget management application with the following key features:

- **Multi-user Collaboration**: Create trips and invite friends to manage expenses together
- **Expense Tracking**: Record and categorize travel expenses with detailed information
- **Budget Management**: Set and monitor budgets for different expense categories
- **Real-time Analytics**: Get instant insights into your spending patterns
- **Location-based Expenses**: Track expenses by location/place
- **Mobile-friendly UI**: Responsive design optimized for mobile devices
- **Email Verification**: Secure account verification via email
- **Social Login**: Sign in with Google for convenience

## Tech Stack

Tracktrip is built using modern web technologies:

### Frontend

- **React 19** with TypeScript
- **TanStack Router** for client-side routing
- **TanStack Query** for data fetching and caching
- **tRPC** for type-safe API communication
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible components
- **Recharts** for data visualization
- **Day.js** for date manipulation

### Backend

- **Bun** JavaScript runtime
- **tRPC** for API endpoints
- **Drizzle ORM** for database interactions
- **PostgreSQL** for relational data storage
- **Better Auth** for authentication
- **Resend** for transactional emails

### Infrastructure

- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **PWA** capabilities for mobile installation

## Architecture

Tracktrip follows a modern web application architecture:

- **Monorepo Structure**: Single repository containing both frontend and backend code
- **Component-based UI**: Organized React components for reusability
- **Modular Routing**: Separated API routers for different domains (travels, transactions, budgets, etc.)
- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **Atomic Design**: UI components organized by feature domains

### Key Directories

- `src/components/`: React components organized by feature
- `src/db/`: Database schema and ORM configuration
- `src/trpc/`: API routers and procedures
- `src/auth/`: Authentication configuration
- `migrations/`: Database migration files

### Application Flow

1. **Authentication**: Users sign in via email/password or Google OAuth
2. **Travel Management**: Users create and manage trips
3. **Expense Tracking**: Users record expenses with categories and locations
4. **Budget Monitoring**: Users set and track budgets against actual spending
5. **Analytics**: Users view spending patterns and insights

## Database Schema

The application uses a PostgreSQL database with the following key tables:

### Core Tables

- **users**: User accounts with authentication information
- **travels**: Trip information including dates, currency, and owner
- **travels_users**: Many-to-many relationship between users and travels
- **transactions**: Financial transactions with categories, amounts, and metadata
- **categories**: Expense categories (food, transport, accommodation, etc.)
- **places**: Locations where expenses occur
- **budgets**: Budget limits for different expense categories

### Authentication Tables

- **sessions**: User sessions for authentication
- **accounts**: Social login accounts (Google, etc.)
- **verifications**: Email verification tokens

### Relationships

- Users can belong to multiple travels
- Each travel has its own set of transactions, categories, and places
- Transactions reference categories and places
- Budgets can be set per category type or specific category

## Authentication

Tracktrip implements secure authentication with:

- **Email/Password**: Traditional email and password login
- **Google OAuth**: Social login via Google
- **Email Verification**: Mandatory email verification for new accounts
- **Password Recovery**: Secure password reset flow
- **Session Management**: Server-side session handling

The authentication system uses **Better Auth** with:

- Drizzle ORM adapter for PostgreSQL
- Resend for transactional emails
- React Start cookies plugin

## Development

### Prerequisites

- Bun JavaScript runtime
- PostgreSQL database
- Node.js for development tools

### Setup

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:
   Create a `.env` file with required variables:

   ```env
   POSTGRES_USER=voyage
   POSTGRES_PASSWORD=password
   POSTGRES_DB=voyage
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   RESEND_API_KEY=your_resend_api_key
   ```

3. **Run database migrations**:

   ```bash
   bun run migrate
   ```

4. **Start development server**:
   ```bash
   bun run dev
   ```

### Available Scripts

- `bun run dev`: Start development server
- `bun run build`: Build production assets
- `bun run start`: Start production server
- `bun run migrate`: Run database migrations
- `bun run lint`: Run ESLint
- `bun run typecheck`: Run TypeScript checks

## Deployment

Tracktrip uses Docker for deployment with GitHub Actions for CI/CD.

### Docker Setup

1. **Build Docker image**:

   ```bash
   docker build -t tracktrip .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up -d
   ```

### CI/CD Pipeline

The GitHub Actions workflow:

1. **Triggers**: Runs on pushes to `main` branch or version tags
2. **Build**: Creates Docker image with production build
3. **Push**: Publishes image to GitHub Container Registry
4. **Deploy**: SSH deployment to production server

### Production Environment

The production setup includes:

- PostgreSQL database service
- Bun runtime for JavaScript execution
- PWA capabilities for mobile installation
- Caching headers for static assets

### Progressive Web App (PWA)

Tracktrip is designed as a Progressive Web App with:

- **Offline Support**: Service worker for offline functionality
- **Installable**: Can be installed on mobile devices like a native app
- **Push Notifications**: Capable of receiving notifications
- **Responsive Design**: Optimized for both mobile and desktop

The PWA configuration includes:

- **Service Worker**: Configured with Vite PWA plugin
- **Manifest**: Web app manifest with icons and theme colors
- **Caching**: Static asset caching for offline access
- **Install Prompt**: Automatic installation prompt for users

### Service Worker Features

The service worker implements advanced caching strategies:

- **Cache-first**: For static assets and fonts
- **Stale-while-revalidate**: For Google Fonts
- **Network-first with fallback**: For navigation requests
- **Automatic cache cleaning**: Removes outdated assets during activation
- **Manifest deduplication**: Ensures unique asset caching

### Testing

Tracktrip uses TypeScript's type system for compile-time validation. For runtime testing:

- **ESLint**: Static code analysis for code quality
- **TypeScript**: Compile-time type checking
- **Manual Testing**: Comprehensive manual testing of features

Future testing improvements planned:

- Unit tests for critical components
- Integration tests for API endpoints
- End-to-end tests for user flows

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

### Code Style

- Follow existing code patterns and naming conventions
- Use TypeScript for type safety
- Write clear commit messages
- Keep components focused and reusable

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

## Roadmap

Future enhancements planned:

- Offline-first capabilities
- Advanced analytics and reporting
- Integration with financial services
- Multi-currency support
- Mobile app improvements

<br />

<div align="center">
  Made with ❤️ by the Tracktrip team
</div>

