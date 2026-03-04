# README Generator (ReadMe-Auto-Generator)

Small web app to generate README files by scanning GitHub repositories and using an LLM-powered service.

## Project structure

- Backend: [backend](backend)
- Frontend: [frontend](frontend)

**Tech Stacks**

- **Backend:**
	- **Python & FastAPI:** primary language and web framework for the API and routers.
	- **Uvicorn:** ASGI server for running the FastAPI app.
	- **python-dotenv:** manage environment variables during development.
	- **HTTPX:** HTTP client used for external requests (e.g., GitHub API).
	- **pydantic-settings:** configuration and settings validation.
	- **OpenAI (or LLM client):** used by the `llm_service` for README generation prompts.

- **Frontend:**
	- **React:** UI library for building the single-page application.
	- **TypeScript:** static typing for frontend code.
	- **Vite:** development server and build tool.
	- **Tailwind CSS & PostCSS:** utility-first styling and CSS processing.
	- **Axios:** HTTP client used to communicate with the backend API.
	- **React Router:** client-side routing for pages like `Login`, `Callback`, and `Dashboard`.
	- **react-markdown:** render generated README content as Markdown in the UI.
	- **lucide-react, clsx, tailwind-merge:** UI utilities and iconography helpers.


Key backend files:
- [backend/requirements.txt](backend/requirements.txt)
- [backend/app/main.py](backend/app/main.py)

Key frontend files:
- [frontend/package.json](frontend/package.json)

## Quick Start

Requirements:
- Python 3.10+ for the backend
- Node.js 18+ and npm/yarn/pnpm for the frontend

### Backend (API)

1. Create and activate a virtual environment:

```bash
python -m venv .venv
# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1
# macOS / Linux
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

3. Set environment variables (example):

- `GITHUB_TOKEN` — token used to access GitHub repositories (if needed)
- `OPENAI_API_KEY` — API key for the LLM provider (if used by the project)
- `BACKEND_CORS_ORIGINS` — optional CORS origins (comma-separated)

4. Run the backend (development):

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend registers routers at `/auth` and `/api` and serves a small root endpoint at `/`.

### Frontend (UI)

1. Install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

2. The frontend uses Vite. By default the dev server runs on `http://localhost:5173`.

To build a production bundle:

```bash
npm run build
```

## API Overview

- `GET /` — root welcome message
- `POST /auth/...` — authentication-related routes (see [backend/app/api/auth.py](backend/app/api/auth.py))
- `POST /api/...` — main API endpoints for scanning and README generation (see [backend/app/api/endpoints.py](backend/app/api/endpoints.py))

Explore the backend code to see exact payloads and parameters. The FastAPI application is defined in [backend/app/main.py](backend/app/main.py).

## Development Notes

- CORS origins are configurable via `BACKEND_CORS_ORIGINS` in the backend configuration.
- The frontend communicates with the backend API; update the base API URL in `frontend/src/services/api.ts` if running on a different host/port.

## Contributing

1. Open an issue describing the change or feature.
2. Create a branch with a descriptive name.
3. Submit a PR with tests and a short description of the change.

## License

This repository does not include a license file by default. Add a `LICENSE` file to declare a license.

## Contact

For questions, open an issue or reach out in the project tracker.
