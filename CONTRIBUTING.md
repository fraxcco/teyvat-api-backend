# Contributing to Teyvat API

Thank you for your interest in contributing to Teyvat API.

The following is a set of guidelines for contributing to Teyvat API. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/fraxcco/teyvat-api-backend.git
    cd teyvat-api-backend
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment variables**:
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```

## Development Workflow

1.  **Create a branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  **Make your changes**.
3.  **Run tests** to ensure nothing is broken:
    ```bash
    npm test
    ```
4.  **Commit your changes** using descriptive commit messages.
5.  **Push to your fork**:
    ```bash
    git push origin feature/amazing-feature
    ```
6.  **Submit a Pull Request** to the main repository.

## Code Style

*   We use **TypeScript**. Please ensure your code is strongly typed.
*   Follow the existing project structure:
    *   `src/application`: Business logic (Controllers, Services, Repositories).
    *   `src/components`: Data definitions (Models, Interfaces).
    *   `src/infrastructure`: Framework code (Routes, Middleware).
*   Ensure all new features have corresponding **tests**.

## Reporting Bugs

This section guides you through submitting a bug report.

*   **Use a clear and descriptive title**.
*   **Describe the exact steps to reproduce the problem**.
*   **Describe the behavior you observed** after following the steps.
*   **Explain which behavior you expected to see** instead and why.

## License

By contributing, you agree that your contributions will be licensed under the [project's license](./LICENSE).