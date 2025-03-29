# Contributing to abort-signal-polyfill

Thank you for your interest in contributing to the AbortSignal polyfill! This document will guide you through the process.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

## Building the Project

- `npm run build` - Builds CommonJS, ESM and type declarations

## Development Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Add tests for your changes
4. Run tests to ensure they pass: `npm test`
5. Lint your code: `npm run lint`
6. Commit your changes
7. Push to your fork: `git push origin feature/my-feature`
8. Open a pull request

## Pull Request Guidelines

- Include tests for any new functionality
- Update documentation if needed
- Follow the existing code style
- Keep pull requests focused on a single topic
- Write a clear description of what your PR does

## Release Process

Releases are handled by the maintainers:

1. Update version in package.json
2. Create a commit with message starting with "Release v1.x.x"
3. Push to main branch
4. The GitHub Action will automatically publish to npm

## Code of Conduct

Please be respectful and considerate of others when contributing. We aim to maintain a welcoming and inclusive environment for everyone.
