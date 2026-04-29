"""Local FastAPI entrypoint for the Moonshot assistant API."""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .src.moonshot import router as moonshot_router

load_dotenv(Path(__file__).resolve().with_name(".env"))

app = FastAPI(
    title="Moonshot API",
    version="0.1.0",
    description="Local FastAPI mirror of the Moonshot assistant endpoints.",
)

@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": str(exc.detail)})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    messages = []
    for issue in exc.errors():
        location = " -> ".join(str(part) for part in issue.get("loc", []))
        message = issue.get("msg", "Invalid request.")
        messages.append(f"{location}: {message}" if location else message)
    return JSONResponse(status_code=400, content={"error": "; ".join(messages) or "Invalid request."})


@app.get("/")
async def root() -> dict[str, str | bool]:
    return {"ok": True, "service": "moonshot-api"}


app.include_router(moonshot_router)
