#!/bin/bash
# GCP Pre-flight Check & API Enablement
PROJECT_ID="project-f685236d-caf1-43ab-ac0"

echo "🔍 Verifying APIs for $PROJECT_ID..."

# Enable necessary APIs
SERVICES=(
  "cloudbuild.googleapis.com"
  "run.googleapis.com"
  "containerregistry.googleapis.com"
  "artifactregistry.googleapis.com"
  "secretmanager.googleapis.com"
  "storage.googleapis.com"
)

for SERVICE in "${SERVICES[@]}"; do
  echo "✅ Enabling $SERVICE..."
  gcloud services enable $SERVICE --project=$PROJECT_ID
done

echo "⚙️ Setting local configuration..."
gcloud config set project $PROJECT_ID

echo "🚀 Ready! Please try running ./deploy.sh again."
