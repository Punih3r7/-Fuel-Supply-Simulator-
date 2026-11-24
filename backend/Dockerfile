FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DATABASE_URL=postgresql://fuel:fuel@postgres:5432/fueldb
ENV REDIS_URL=redis://redis:6379
ENV SIMULATOR_URL=http://simulator:8000

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
