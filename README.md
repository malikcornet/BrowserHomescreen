# BrowserHomescreen

This project started as a way for me to learn React.
Once the basics clicked, I vibecoded it forward and kept improving it until it became something actually usable.

It is now a small desktop-like browser experience built with React + TypeScript.

## Why This Exists

- Learn React by building a non-trivial UI.
- Experiment quickly and follow ideas without over-planning.
- Turn a learning project into a usable app over time.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Tech Stack

- React
- TypeScript
- Vite

## Project Structure

```text
src/
  app/                    # app shell and top-level composition
  pages/                  # route-level pages
  features/               # feature modules (desktop, taskbar, programs, window manager)
  entities/               # domain entities (filesystem model + UI)
  data/                   # static seed data / fixtures
  shared/                 # generic shared code (UI, utils)
```

Architecture and dependency rules are documented in `src/ARCHITECTURE.md`.
