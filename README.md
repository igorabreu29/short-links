# Short Links API

This is a backend application for creating and managing short links, similar to services like Bitly. It allows users to shorten a long URL, and then redirects users from the short link to the original URL, while also tracking metrics.

## Tech Stack

- **Backend:** Node.js, Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Cache:** Redis
- **Validation:** Zod
- **Testing:** Vitest
- **Containerization:** Docker

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/short_links.git
    cd short-links
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**

    Copy the example environment file and update it with your configuration.

    ```bash
    cp .env.example .env
    ```

    Your `.env` file should look like this:

    ```
    NODE_ENV=development

    # Server
    PORT=3333

    # Postgres
    POSTGRES_USER=docker
    POSTGRES_PASSWORD=docker
    POSTGRES_DB=short_links
    DATABASE_URL="postgresql://docker:docker@localhost:5432/short_links"

    # Redis
    REDIS_HOST=localhost
    REDIS_PASSWORD=docker
    REDIS_PORT=6379
    REDIS_DB=0
    ```

4.  **Start the databases:**

    Run the following command to start the PostgreSQL and Redis containers.

    ```bash
    docker-compose up -d
    ```

5.  **Run database setup:**

    This will create the necessary tables in your database.

    ```bash
    pnpm setup:db
    ```

6.  **Run the application:**
    ```bash
    pnpm dev
    ```

The API should now be running at `http://localhost:3333`.

## Available Scripts

- `dev`: Starts the development server with hot-reloading.
- `start`: Starts the production-ready server from the `dist` folder.
- `build`: Compiles the TypeScript code to JavaScript.
- `test`: Runs the test suite using Vitest.
- `setup:db`: Runs the database setup script.
- `compose:up`: Starts the Docker containers for the application.
- `compose:test:up`: Starts the Docker containers for the test environment.

## API Reference

The API provides the following endpoints:

- `GET /links`: Retrieves a list of all created links.
- `POST /links`: Creates a new short link.
  - **Body:** `{ "url": "https://example.com" }`
- `GET /links/:code`: Redirects to the original URL associated with the short code.
- `GET /links/metrics`: Retrieves metrics for a specific link (e.g., click count).
