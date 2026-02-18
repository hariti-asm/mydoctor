#!/bin/bash

# Configuration
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
PREFIX="mydoctor"

# Services to push
if [ $# -gt 0 ]; then
  SERVICES=("$@")
else
  SERVICES=(
    "discovery-server"
    "api-gateway"
    "user-service"
    "doctor-service"
    "appointment-service"
    "patient-service"
    "medicalrecord-service"
    "payment-service"
    "shell"
  )
fi

echo "Starting MyDoctor AWS Deployment Flow..."

# 1. Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 2. Build and Push each service
for SERVICE in "${SERVICES[@]}"
do
  REPO_NAME="$PREFIX-$SERVICE"
  IMAGE_TAG="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"

  echo "----------------------------------------------------"
  echo "Processing Repository: $REPO_NAME"
  
  # Create repo if not exists
  aws ecr create-repository --repository-name $REPO_NAME --region $REGION || echo "Repo already exists"

  # Build Image (using docker-compose build context logic)
  if [ "$SERVICE" == "shell" ]; then
    CONTEXT="./mydoctor-mfe/shell"
  else
    CONTEXT="./backend/$SERVICE"
  fi

  echo "Building image from $CONTEXT..."
  docker build --platform linux/amd64 -t $REPO_NAME $CONTEXT

  # Tag and Push
  echo "Tagging and Pushing $IMAGE_TAG..."
  docker tag $REPO_NAME:latest $IMAGE_TAG
  docker push $IMAGE_TAG
done

echo "All images have been pushed to AWS ECR successfully!"
echo "You can now find your images at: https://$REGION.console.aws.amazon.com/ecr/repositories"
