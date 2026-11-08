FROM ghcr.io/astral-sh/uv:0.13.6 AS uv
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 UV_PYTHON_DOWNLOADS=never OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1
WORKDIR /app
COPY --from=uv /uv /usr/local/bin/uv
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --locked --no-dev --no-install-project

RUN useradd --uid 10001 --create-home canary && mkdir /app/var && chown canary:canary /app/var
COPY backend ./backend
COPY eval ./eval
USER canary
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=4s --start-period=60s CMD ["/app/.venv/bin/python", "-c", "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.getenv('PORT', '8000') + '/healthz', timeout=3).close()"]
CMD ["/bin/sh", "-c", "exec /app/.venv/bin/uvicorn backend.app.api.main:app --host 0.0.0.0 --port ${PORT:-8000} --no-access-log"]
