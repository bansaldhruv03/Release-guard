#!/bin/bash
set -e

# TODO: Replace with your actual new GCP Project ID
PROJECT_ID="poc-project-491709"
REGION="us-central1"
REPO_NAME="docker-repo"
PIPELINE_FILE="clouddeploy.yaml"

echo "🚀 Initializing Delivery Pipeline for Project: $PROJECT_ID..."

# 1. Provide a reminder to set the project ID if the user hasn't
if [ "$PROJECT_ID" == "YOUR_NEW_PROJECT_ID" ]; then
    echo "❌ PLEASE EDIT THIS FILE AND SET YOUR PROJECT_ID BEFORE RUNNING!"
    exit 1
fi

# 2. Create Artifact Registry repository if it doesn't exist
echo "📦 Ensuring Artifact Registry repository '$REPO_NAME' exists..."
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Release Guard" \
    --project=$PROJECT_ID || true

# 3. Apply the Delivery Pipeline
echo "🚢 Applying Cloud Deploy pipeline configuration..."
gcloud deploy apply --file=$PIPELINE_FILE --region=$REGION --project=$PROJECT_ID

echo "✅ Pipeline setup complete!"
echo "You can now push code to trigger Cloud Build, or manually run:"
echo "gcloud builds submit --config cloudbuild.yaml ."
