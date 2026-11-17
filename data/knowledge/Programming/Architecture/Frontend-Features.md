# Frontend Feature Architecture

## Folders

- `Components/` — shared reusable UI
- `Features/` — page/feature modules (one concern per feature folder)
- `Api/` — HTTP clients that talk to the backend only

## Allowed

- Features may use Components and Api
- Components may use other shared Components
- Api may call the backend over HTTP

## Forbidden

- A feature must not import or call another feature
- Components must not depend on Features
- Features and Components must not call backend HTTP directly — only Api does that

## Placement

- Page/UI orchestration lives in Features
- Shared widgets live in Components
- New work goes under `Features/{FeatureName}/`

Related: Layered-Backend
