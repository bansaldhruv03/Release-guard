#!/bin/bash
# GCP Pre-flight Check & API Enablement
# TODO: Replace with your actual new GCP Project ID
PROJECT_ID="poc-project-491709"

echo "🔍 Verifying APIs for $PROJECT_ID..."

# Enable necessary APIs
SERVICES=(
  "cloudbuild.googleapis.com"
  "run.googleapis.com"
  "containerregistry.googleapis.com"
  "artifactregistry.googleapis.com"
  "secretmanager.googleapis.com"
  "storage.googleapis.com"
  "clouddeploy.googleapis.com"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "✅ Enabling $SERVICE..."
  gcloud services enable $SERVICE --project=$PROJECT_ID
done

echo "⚙️ Setting local configuration..."
gcloud config set project $PROJECT_ID

echo "🚀 Ready! APIs enabled."
