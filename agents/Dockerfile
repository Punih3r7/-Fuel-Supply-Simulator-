FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV SIMULATOR_URL=http://simulator:8000
ENV BACKEND_URL=http://backend:8080

CMD ["python", "orchestrator.py"]
