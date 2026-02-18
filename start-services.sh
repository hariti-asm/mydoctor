#!/usr/bin/env bash

# Load environment variables from .env if it exists
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Set default values if not provided in .env
export JWT_SECRET_KEY=${JWT_SECRET_KEY}
export APP_FRONTEND_URL=${APP_FRONTEND_URL:-http://localhost:4200}
export AWS_REGION=${AWS_REGION:-us-east-1}

# Start Discovery Server
echo "Starting Discovery Server..."
./mvnw -f backend/discovery-server/pom.xml spring-boot:run &
sleep 15

# Start API Gateway
echo "Starting API Gateway..."
./mvnw -f backend/api-gateway/pom.xml spring-boot:run &

# Start User Service
echo "Starting User Service..."
./mvnw -f backend/user-service/pom.xml spring-boot:run &

# Start Appointment Service
echo "Starting Appointment Service..."
./mvnw -f backend/appointment-service/pom.xml spring-boot:run &

# Start Patient Service
echo "Starting Patient Service..."
./mvnw -f backend/patient-service/pom.xml spring-boot:run &

# Start Doctor Service
echo "Starting Doctor Service..."
./mvnw -f backend/doctor-service/pom.xml spring-boot:run &

# Start Medical Record Service
echo "Starting Medical Record Service..."
./mvnw -f backend/medicalrecord-service/pom.xml spring-boot:run &

echo "All services are starting in the background. Please wait a minute for them to register with Eureka."
