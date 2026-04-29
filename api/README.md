# Moonshot API

This folder is the local FastAPI mirror of the Moonshot endpoints that will later
live inside `dsc-energy-ai-backend`.

The purpose of this copy is:

- test the Moonshot assistant locally from this frontend repo
- keep the route and payload contract stable
- make the later move into `dsc-energy-ai-backend` mostly a file copy of the
  `api/src/moonshot*.py` modules plus router registration

## Routes

- `GET /api/moonshot/health`
- `POST /api/moonshot/parse-query`
- `POST /api/moonshot/project-synopsis`

## Local setup

1. Create a virtual environment:

```bash
cd /Users/ben/Documents/UNDP/SEH/fe-energy-moonshot
python3 -m venv api/.venv
source api/.venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r api/requirements.txt
```

3. Create the env file:

```bash
cp api/.env.example api/.env
```

4. Set the Azure OpenAI values in `api/.env`.
   For production-style local testing, also set:
   `ALLOWED_ORIGINS=https://undp-data.github.io`

5. Run the backend:

```bash
python3 -m uvicorn api.main:app --reload --host 127.0.0.1 --port 3001
```

6. Run the frontend in another terminal:

```bash
cd /Users/ben/Documents/UNDP/SEH/fe-energy-moonshot
npm start
```

The frontend dev server proxies `/api/*` to `http://localhost:3001`.

## Abuse controls

Moonshot includes lightweight server-side protections:

- per-IP rate limiting on `parse-query` and `project-synopsis`
- POST origin enforcement when `ALLOWED_ORIGINS` is configured
- prompt length caps through request validation

Useful env knobs:

- `ALLOWED_ORIGINS=https://undp-data.github.io`
- `MOONSHOT_RATE_LIMIT_WINDOW_SECONDS=300`
- `MOONSHOT_PARSE_RATE_LIMIT=60`
- `MOONSHOT_SYNOPSIS_RATE_LIMIT=120`

## Future move into `dsc-energy-ai-backend`

When you move this into `/Users/ben/Documents/UNDP/SEH/dsc-energy-ai-backend`,
the mirrored pieces to copy are:

- `api/src/moonshot.py`
- `api/src/moonshot_models.py`
- the Moonshot tests, adapted to that repo's test layout

Then:

1. register the Moonshot router in the FastAPI app there
2. keep the endpoint prefix as `/api/moonshot`
3. set the Azure env values on the existing backend deployment

This local folder is intentionally close to that target structure, but it is not
meant to become the long-term deployed service from this repo.

For the exact sync command and target-repo integration steps, see
[PORT_TO_DSC_BACKEND.md](/Users/ben/Documents/UNDP/SEH/fe-energy-moonshot/api/PORT_TO_DSC_BACKEND.md).
