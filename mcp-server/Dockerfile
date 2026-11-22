FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV SIMULATOR_URL=http://simulator:8000

EXPOSE 8001

CMD ["python", "server.py"]
