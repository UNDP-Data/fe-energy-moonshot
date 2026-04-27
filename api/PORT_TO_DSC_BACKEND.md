# Porting Moonshot Into `dsc-energy-ai-backend`

This local `api/` folder is a mirror of the Moonshot backend implementation so
you can test from the frontend repo first, then move the production backend into:

- `/Users/ben/Documents/UNDP/SEH/dsc-energy-ai-backend`

## Files to copy

These are the mirrored source files that belong in the backend repo:

- `api/src/moonshot.py` -> `dsc-energy-ai-backend/src/moonshot.py`
- `api/src/moonshot_models.py` -> `dsc-energy-ai-backend/src/moonshot_models.py`
- `api/tests/test_moonshot.py` -> `dsc-energy-ai-backend/tests/test_moonshot.py`

## One-command local sync

Dry run:

```bash
cd /Users/ben/Documents/UNDP/SEH/fe-energy-moonshot
npm run api:sync
```

Apply:

```bash
cd /Users/ben/Documents/UNDP/SEH/fe-energy-moonshot
npm run api:sync:apply
```

If the backend repo lives somewhere else:

```bash
cd /Users/ben/Documents/UNDP/SEH/fe-energy-moonshot
ENERGY_AI_BACKEND_DIR=/absolute/path/to/dsc-energy-ai-backend npm run api:sync:apply
```

## Required integration in `dsc-energy-ai-backend`

After the files are copied, add this import in
`/Users/ben/Documents/UNDP/SEH/dsc-energy-ai-backend/main.py`:

```python
from src.moonshot import router as moonshot_router
```

Then register the router after the FastAPI app is created:

```python
app.include_router(moonshot_router)
```

That exposes:

- `GET /api/moonshot/health`
- `POST /api/moonshot/parse-query`
- `POST /api/moonshot/project-synopsis`

## Required Azure environment variables

Set these on the deployed backend:

- `AZURE_OPENAI_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_MOONSHOT_PARSE_DEPLOYMENT`
- `AZURE_OPENAI_MOONSHOT_SYNOPSIS_DEPLOYMENT`

Optional compatibility vars still supported by the local mirror:

- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_CHAT_MODEL`
- `AZURE_OPENAI_PARSE_DEPLOYMENT`
- `AZURE_OPENAI_SYNOPSIS_DEPLOYMENT`
- `OPENAI_API_KEY`
- `OPENAI_PARSE_MODEL`
- `OPENAI_SYNOPSIS_MODEL`

## Verification inside `dsc-energy-ai-backend`

After syncing and registering the router:

```bash
cd /Users/ben/Documents/UNDP/SEH/dsc-energy-ai-backend
.venv/bin/python -m pytest tests/test_moonshot.py
```

Then start the backend and check:

```bash
curl http://127.0.0.1:8000/api/moonshot/health
```
