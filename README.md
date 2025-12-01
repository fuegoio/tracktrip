<div align="center" width="200px">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="website/public/title.white.png">
   <source media="(prefers-color-scheme: light)" srcset="website/public/title.black.png">
   <img width="200" alt="logo" src="website/public/title.white.png">
 </picture>
</div>

<div align="center">
  <strong>Tracktrip is a mobile and web application to record and budget your travel expenses.</strong>
</div>

<br />

## Why?

As a traveler myself, I struggled to keep track of all my expenses in long trips. I wanted a simple app to set a budget, keep track of expenses and provide small analytics to correct the trajectory while travelling.

## Features

Tracktrip is a comprehensive travel budget management application with the following key features:

- **Expense tracking**: Record and categorize travel expenses with detailed information
- **Budget management**: Set and monitor budgets for different expense categories
- **Multi-user collaboration**: Create trips and invite friends to manage expenses together
- **Real-time analytics**: Get instant insights into your spending patterns
- **Location-based expenses**: Track expenses by location/place
- **Mobile-friendly UI**: Responsive design optimized for mobile devices
- **Offline-first**: Works offline (read-only) thanks to intensive caching

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
- **PWA** capabilities for mobile installation

### Backend

- **Bun** JavaScript runtime
- **tRPC** for API endpoints
- **Drizzle ORM** for database interactions
- **PostgreSQL** for relational data storage
- **Better Auth** for authentication
- **Resend** for transactional emails

## Authentication

Tracktrip implements secure authentication with:

- **Email/Password**: Traditional email and password login
- **Google OAuth**: Social login via Google

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

<br />

<div align="center">
  Made with ❤️ by one traveler, for others travelers
</div>
