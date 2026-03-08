# Frontend Structure

This project follows a feature-oriented React structure with clear ownership boundaries.

## Layers

- `src/app`: app shell and top-level composition (`App.tsx`, app-level CSS).
- `src/pages`: route-level pages that compose features (e.g. `home/HomePage.tsx`).
- `src/features`: user-facing feature modules (desktop, taskbar, window manager, programs).
- `src/entities`: domain entities and reusable entity UI (filesystem models/icons).
- `src/data`: static seed data and fixtures.
- `src/shared`: generic shared UI/utilities with no domain coupling.

## Rules

- Keep route composition in `pages`, not in `features`.
- Keep business/domain models in `entities/**/model`.
- Keep entity-specific visual components in `entities/**/ui`.
- Keep complex interaction logic in colocated hooks inside the owning feature.
- Prefer one-way dependencies:
  - `app -> pages -> features -> entities -> shared`
  - `data` can be consumed by `pages` or `features`.
- Avoid importing from higher layers (for example, `entities` must not import from `features`).
- Prefer aliases over deep relative imports:
  - `@app/*`, `@pages/*`, `@features/*`, `@entities/*`, `@data/*`, `@shared/*`
- Prefer folder barrels (`index.ts`) for public module APIs.

## Import Style

- Use named imports from barrels when available (for example `@features/taskbar`).
- Keep local relative imports for same-folder files (`./Window`, `./Window.module.css`).
- Export only stable public modules from barrels; keep internal helpers un-exported.

## Naming Conventions

- Use `handle...` for user/event actions and state mutations (for example `handleEditingSubmit`).
- Use `build...` for pure builder functions that create derived data (for example context menu items).
- Use `use...Controller` for feature orchestration hooks that hide complex behavior from UI components.
- Keep UI components declarative: read state from a controller hook and pass handlers/builders to child components.

## Current Example

- `features/window-manager` owns window behavior and hooks.
- `features/desktop` composes desktop + window manager.
- `features/programs/file-explorer` reuses `entities/filesystem` models and icon UI.
- `pages/home/HomePage` composes `Desktop` and `TaskBar`.
