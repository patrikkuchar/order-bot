#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHART_PATH="${ROOT_DIR}/charts/my-template"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

RELEASE_NAME="${RELEASE_NAME:-my-template}"
NAMESPACE="${NAMESPACE:-my-template}"
CLUSTER_NAME="${CLUSTER_NAME:-my-template-local}"
BACKEND_IMAGE="${BACKEND_IMAGE:-local/moja-firma-backend}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-local/moja-firma-frontend}"
IMAGE_TAG="${IMAGE_TAG:-local}"
PROVIDER="kind"
SKIP_BUILD=0
DESTROY_ONLY=0
PORT_FORWARD=0

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]
  --provider <kind|minikube>   Cluster implementation to use (default: kind)
  --tag <tag>                  Image tag applied to backend/frontend (default: ${IMAGE_TAG})
  --skip-build                 Reuse already built images instead of rebuilding
  --port-forward               Start kubectl port-forwards for backend (18080) and frontend (18081)
  --destroy                    Remove release (and kind cluster, if used) then exit
  -h, --help                   Show this help

Environment overrides:
  RELEASE_NAME, NAMESPACE, CLUSTER_NAME, BACKEND_IMAGE, FRONTEND_IMAGE, IMAGE_TAG
  SEALED_POSTGRES_USER, SEALED_POSTGRES_PASSWORD   (required by the Helm chart)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --provider)
      PROVIDER="$2"
      shift 2
      ;;
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --port-forward)
      PORT_FORWARD=1
      shift
      ;;
    --destroy)
      DESTROY_ONLY=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

BACKEND_REF="${BACKEND_IMAGE}:${IMAGE_TAG}"
FRONTEND_REF="${FRONTEND_IMAGE}:${IMAGE_TAG}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Missing required command: $1" >&2
    exit 1
  fi
}

ensure_prereqs() {
  require_cmd helm
  require_cmd kubectl
  case "$PROVIDER" in
    kind) require_cmd kind ;;
    minikube) require_cmd minikube ;;
    *)
      echo "Unsupported provider '$PROVIDER'. Use kind or minikube." >&2
      exit 1
      ;;
  esac
  if [[ "$DESTROY_ONLY" -eq 0 ]]; then
    require_cmd docker
    : "${SEALED_POSTGRES_USER:?Set SEALED_POSTGRES_USER to the kubeseal output for POSTGRES_USER}"
    : "${SEALED_POSTGRES_PASSWORD:?Set SEALED_POSTGRES_PASSWORD to the kubeseal output for POSTGRES_PASSWORD}"
  fi
}

destroy_stack() {
  echo "🧹 Removing Helm release ${RELEASE_NAME} (namespace ${NAMESPACE})..."
  if helm status "${RELEASE_NAME}" -n "${NAMESPACE}" >/dev/null 2>&1; then
    helm uninstall "${RELEASE_NAME}" -n "${NAMESPACE}"
  else
    echo "  Release not found, skipping Helm uninstall."
  fi

  if [[ "$PROVIDER" == "kind" ]]; then
    if kind get clusters | grep -Eq "^${CLUSTER_NAME}\$"; then
      echo "🗑️  Deleting kind cluster ${CLUSTER_NAME}..."
      kind delete cluster --name "${CLUSTER_NAME}"
    else
      echo "  Kind cluster ${CLUSTER_NAME} not present, skipping deletion."
    fi
  elif [[ "$PROVIDER" == "minikube" ]]; then
    echo "ℹ️  Skipping automatic minikube deletion. Run 'minikube delete' if desired."
  fi
}

ensure_kind_cluster() {
  if ! kind get clusters | grep -Eq "^${CLUSTER_NAME}\$"; then
    echo "🚀 Creating kind cluster ${CLUSTER_NAME}..."
    kind create cluster --name "${CLUSTER_NAME}"
  else
    echo "✅ kind cluster ${CLUSTER_NAME} already exists."
  fi
  kubectl config use-context "kind-${CLUSTER_NAME}"
}

ensure_minikube_cluster() {
  if ! minikube status >/dev/null 2>&1; then
    echo "🚀 Starting minikube..."
    minikube start --driver=docker
  else
    echo "✅ minikube already running."
  fi
  echo "🔧 Configuring Docker to point to minikube daemon..."
  eval "$(minikube docker-env)"
  kubectl config use-context minikube
}

build_images() {
  if [[ "$SKIP_BUILD" -eq 1 ]]; then
    echo "⏭️  Skipping docker build as requested."
    return
  fi

  echo "🧱 Building backend image (${BACKEND_REF})..."
  docker build -t "${BACKEND_REF}" "${BACKEND_DIR}"

  echo "🧱 Building frontend image (${FRONTEND_REF})..."
  docker build -t "${FRONTEND_REF}" "${FRONTEND_DIR}"
}

load_images_into_cluster() {
  if [[ "$PROVIDER" == "kind" ]]; then
    echo "📦 Loading images into kind..."
    kind load docker-image "${BACKEND_REF}" --name "${CLUSTER_NAME}"
    kind load docker-image "${FRONTEND_REF}" --name "${CLUSTER_NAME}"
  else
    echo "📦 Images already available to minikube Docker daemon."
  fi
}

deploy_chart() {
  echo "🚢 Deploying release ${RELEASE_NAME} to namespace ${NAMESPACE}..."
  helm upgrade --install "${RELEASE_NAME}" "${CHART_PATH}" \
    --namespace "${NAMESPACE}" \
    --create-namespace \
    --set backend.image="${BACKEND_IMAGE}" \
    --set backend.tag="${IMAGE_TAG}" \
    --set frontend.image="${FRONTEND_IMAGE}" \
    --set frontend.tag="${IMAGE_TAG}" \
    --set postgres.sealedUser="${SEALED_POSTGRES_USER}" \
    --set postgres.sealedPassword="${SEALED_POSTGRES_PASSWORD}" \
    --wait --timeout 10m

  echo "⏳ Waiting for backend deployment..."
  kubectl rollout status deployment/backend -n "${NAMESPACE}"
  echo "⏳ Waiting for frontend deployment..."
  kubectl rollout status deployment/frontend -n "${NAMESPACE}"
}

start_port_forward() {
  echo "🔌 Starting port-forwards (Ctrl+C to stop)..."
  echo "  Backend -> http://localhost:18080"
  echo "  Frontend -> http://localhost:18081"
  kubectl port-forward svc/backend 18080:8080 -n "${NAMESPACE}" &
  backend_pf=$!
  kubectl port-forward svc/frontend 18081:80 -n "${NAMESPACE}" &
  frontend_pf=$!
  wait "${backend_pf}" "${frontend_pf}"
}

main() {
  ensure_prereqs

  if [[ "$DESTROY_ONLY" -eq 1 ]]; then
    destroy_stack
    exit 0
  fi

  case "$PROVIDER" in
    kind)
      ensure_kind_cluster
      ;;
    minikube)
      ensure_minikube_cluster
      ;;
  esac

  build_images
  load_images_into_cluster
  deploy_chart

  kubectl get pods -n "${NAMESPACE}"

  if [[ "$PORT_FORWARD" -eq 1 ]]; then
    start_port_forward
  else
    cat <<EOF
🎉 Deployment ready.
  Backend service: kubectl port-forward svc/backend 8080:8080 -n ${NAMESPACE}
  Frontend service: kubectl port-forward svc/frontend 4200:80 -n ${NAMESPACE}
  Destroy stack: ${BASH_SOURCE[0]} --destroy [--provider ${PROVIDER}]
EOF
  fi
}

main
