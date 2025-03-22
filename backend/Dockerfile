FROM python:3.12-alpine3.19
LABEL maintainer="Terrence Hosang"

# Set environment variable
ENV PYTHONUNBUFFERED 1

# Copy requirements files
COPY ./requirements.txt /tmp/requirements.txt
COPY ./requirements.dev.txt /tmp/requirements.dev.txt

# Install system dependencies and Python packages as root
RUN apk add --update --no-cache \
    postgresql-client \
    jpeg-dev \
    zlib-dev \
    libjpeg \
    gcc \
    libc-dev \
    musl-dev \
    python3-dev \
    libffi-dev \
    postgresql-dev \
    build-base \
    make && \
    python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    /py/bin/pip install -r /tmp/requirements.txt && \
    /py/bin/pip install -r /tmp/requirements.dev.txt && \
    rm -rf /tmp


# Add a non-root user and prepare directories
RUN adduser \
    --disabled-password \
    --no-create-home \
    django-user && \
    mkdir -p /vol/web/media && \
    mkdir -p /vol/web/static && \
    chown -R django-user:django-user /vol && \
    chmod -R 755 /vol

# Copy the application code
COPY . /app

# Set the working directory
WORKDIR /app

# Add the virtual environment to PATH
ENV PATH="/py/bin:$PATH"

# Expose the development port
EXPOSE 8000

# Switch to the non-root user
USER django-user

# Argument to toggle development mode (keeping it here for potential future use)
ARG DEV=false
