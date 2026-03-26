#!/bin/bash
set -e

# Configuration
PROJECT_ID="project-f685236d-caf1-43ab-ac0"
REGION="us-central1"
SERVICE_NAME="release-guard-backend"
REPO_NAME="docker-repo"

echo "🚀 Deploying Release Guard Backend to Google Cloud Run..."

# 1. Create Artifact Registry repository if it doesn't exist
gcloud artifacts repositories create $REPO_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for Release Guard" || true

# 2. Build and Push Image (using modern Artifact Registry)
IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
gcloud builds submit --tag $IMAGE_TAG .

# 3. Deploy to Cloud Run (FORCE PORT 8080 AND MAX TIMEOUT)
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --port=8080 \
  --timeout=600 \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=10

echo "✅ Deployment complete!"
echo "Dashboard available at: $(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')"
