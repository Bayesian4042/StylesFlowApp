FROM python:3.12-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the application into the container.
COPY . /app

# Install the application dependencies.
WORKDIR /app
RUN uv add asyncpg
RUN uv sync --frozen --no-cache

# RUN /app/.venv/bin/aerich migrate
# RUN /app/.venv/bin/aerich upgrade

EXPOSE 8000

# Run the application.
CMD ["/app/.venv/bin/fastapi", "run"]
