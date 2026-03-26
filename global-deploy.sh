#!/bin/bash
set -e

# Configuration
PROJECT_ID="project-f685236d-caf1-43ab-ac0"
SERVICE_NAME="release-guard-backend"
REGIONS=("us-central1" "europe-west1" "asia-northeast1")

echo "🌎 Starting Global Rollout for Release Guard..."

# 1. Build and Push Unified Image
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .

# 2. Deploy to Multiple Regions
for REGION in "${REGIONS[@]}"; do
  echo "🚀 Deploying to $REGION..."
  gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,DB_HOST=global-lb-ip"
done

echo "✅ Global Deployment complete!"
echo "Refer to GLOBAL_GCP_GUIDE.md to set up the Global Load Balancer."
