#!/bin/bash
set -euo pipefail

NAMESPACE="my-template"
RELEASE_NAME="my-template"
CHART_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/charts/my-template"
FRONTEND_IMAGE="local/moja-firma-frontend:latest"
BACKEND_IMAGE="local/moja-firma-backend:latest"

: "${SEALED_POSTGRES_USER:?Set SEALED_POSTGRES_USER to the encrypted value produced by kubeseal for POSTGRES_USER}"
: "${SEALED_POSTGRES_PASSWORD:?Set SEALED_POSTGRES_PASSWORD to the encrypted value produced by kubeseal for POSTGRES_PASSWORD}"

if ! command -v minikube >/dev/null 2>&1; then
  echo "❌ minikube command not found" >&2
  exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "❌ helm command not found" >&2
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "❌ kubectl command not found" >&2
  exit 1
fi

echo "🚀 Starting Minikube..."
minikube start --driver=docker

echo "🔧 Configuring Docker to use Minikube daemon..."
eval "$(minikube docker-env)"

echo "🧱 Building backend image (${BACKEND_IMAGE})..."
docker build -t "${BACKEND_IMAGE}" "$(cd "$(dirname "${BASH_SOURCE[0]}")/../backend" && pwd)"

echo "🧱 Building frontend image (${FRONTEND_IMAGE})..."
docker build -t "${FRONTEND_IMAGE}" "$(cd "$(dirname "${BASH_SOURCE[0]}")/../frontend" && pwd)"

echo "📦 Deploying Helm chart..."
helm upgrade --install "${RELEASE_NAME}" "${CHART_PATH}" \
  --namespace "${NAMESPACE}" \
  --create-namespace \
  --set backend.image=local/moja-firma-backend \
  --set backend.tag=latest \
  --set frontend.image=local/moja-firma-frontend \
  --set frontend.tag=latest \
  --set postgres.sealedUser="${SEALED_POSTGRES_USER}" \
  --set postgres.sealedPassword="${SEALED_POSTGRES_PASSWORD}"

echo "⏳ Waiting for deployments to become ready..."
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
kubectl rollout status deployment/backend -n "${NAMESPACE}"

if kubectl get service/frontend -n "${NAMESPACE}" >/dev/null 2>&1; then
  echo "🌍 Accessing frontend service via Minikube tunnel..."
  minikube service frontend -n "${NAMESPACE}"
else
  echo "⚠️ Frontend service not found in namespace ${NAMESPACE}."
fi
