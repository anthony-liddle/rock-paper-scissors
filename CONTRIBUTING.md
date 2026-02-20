# Contributing to Rock Paper Scissors

Thank you for your interest in contributing! Every contribution helps make this project better.

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Your browser and operating system
5. Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please open an issue with:

1. A clear description of the feature
2. Why it would be useful
3. Any implementation ideas you have

### Submitting Code

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the code style guidelines below
3. **Test your changes** thoroughly
4. **Submit a pull request** with a clear description of your changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/anthony-liddle/rock-paper-scissors.git
cd rock-paper-scissors

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build
```

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commit messages must follow this format:

```
<type>(<scope>): <subject>
```

The scope is optional. Examples:

```
feat: add new animation sequence
fix: resolve score calculation error
docs: update README with setup instructions
test: add unit tests for game engine
chore: update dependencies
feat(engine): add tension system
```

### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style/formatting (no logic changes) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `perf` | Performance improvements |
| `revert` | Reverting changes |

A commit-msg hook will validate your commit messages automatically.

## Pre-commit Hooks

This project uses Husky to run checks before each commit:

1. **TypeScript check** - Ensures all code compiles without errors
2. **ESLint** - Lints all `.ts` and `.tsx` files

If any check fails, the commit will be blocked until you fix the issues.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` types

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Prefer composition over prop drilling

### CSS

- Follow existing styling patterns
- Ensure all interactive elements have visible focus states

## Pull Request Process

1. Ensure your code passes linting (`pnpm lint`)
2. Ensure the build succeeds (`pnpm build`)
3. Use semantic commit messages (see above)
4. Update documentation if needed
5. Write a clear PR description explaining your changes
6. Link any related issues
7. Request review from maintainers

Our CI pipeline will automatically run linting and build checks on your PR.

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

Thank you for contributing!
