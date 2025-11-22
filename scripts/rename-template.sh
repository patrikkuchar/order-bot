#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/rename-template.sh <new-app-name> [<new-backend-package>]

Arguments:
  <new-app-name>          Required. New application name used in Helm charts, namespaces and documentation.
  <new-backend-package>   Optional. New base package for the Spring Boot backend (replaces `kuhcorp.template`).
                          Defaults to `kuhcorp.template` if not provided.
USAGE
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
NEW_APP_NAME="$1"
NEW_PACKAGE_NAME="${2:-kuhcorp.template}"

CURRENT_APP_NAME="my-template"
CURRENT_PACKAGE="kuhcorp.template"
CURRENT_APP_CLASS="DemoApplication"

package_to_path() {
  local package="$1"
  echo "${package//./\/}"
}

slug_to_pascal_case() {
  local slug="$1"
  local cleaned="${slug//[^[:alnum:]]/ }"
  local result=""

  for part in $cleaned; do
    part="${part,,}"
    result+="${part^}"
  done

  if [[ -z "$result" ]]; then
    result="App"
  fi

  if [[ "$result" =~ ^[0-9] ]]; then
    result="App${result}"
  fi

  echo "$result"
}

NEW_APP_CLASS="$(slug_to_pascal_case "$NEW_APP_NAME")Application"

replace_in_files() {
  local search="$1"
  local replace="$2"

  local excluded_paths=(
    "$ROOT_DIR/.git"
    "$ROOT_DIR/.idea"
    "$ROOT_DIR/frontend/node_modules"
    "$ROOT_DIR/frontend/dist"
    "$ROOT_DIR/backend/target"
  )

  local prune_args=()
  for path in "${excluded_paths[@]}"; do
    prune_args+=( -path "$path" -o )
  done
  # Remove trailing -o for find syntax.
  prune_args=("${prune_args[@]:0:${#prune_args[@]}-1}")

  # Skip generated/build artifacts, dependency caches and VCS/IDE metadata.
  find "$ROOT_DIR" \
    \( "${prune_args[@]}" \) -prune -o \
    -type f -print0 |
    xargs -0 perl -0pi -e "s/\Q${search}\E/${replace}/g"
}

rename_chart_directory() {
  local current_path="$ROOT_DIR/charts/${CURRENT_APP_NAME}"
  local new_path="$ROOT_DIR/charts/${NEW_APP_NAME}"

  if [[ -d "$current_path" && "$current_path" != "$new_path" ]]; then
    mv "$current_path" "$new_path"
  fi
}

rename_backend_package_directories() {
  local current_path
  current_path=$(package_to_path "$CURRENT_PACKAGE")
  local new_path
  new_path=$(package_to_path "$NEW_PACKAGE_NAME")

  if [[ "$current_path" == "$new_path" ]]; then
    return
  fi

  for src_root in "$ROOT_DIR/backend/src/main/java" "$ROOT_DIR/backend/src/test/java"; do
    if [[ -d "$src_root/$current_path" ]]; then
      local target_dir="$src_root/$new_path"
      mkdir -p "$(dirname "$target_dir")"
      mv "$src_root/$current_path" "$target_dir"
    fi
  done

  # Clean up any now-empty package directories.
  find "$ROOT_DIR/backend/src" -type d -empty -delete
}

rename_java_app_class() {
  local new_package_path
  new_package_path=$(package_to_path "$NEW_PACKAGE_NAME")

  local main_dir="$ROOT_DIR/backend/src/main/java/$new_package_path"
  local test_dir="$ROOT_DIR/backend/src/test/java/$new_package_path"

  if [[ "$CURRENT_APP_CLASS" != "$NEW_APP_CLASS" ]]; then
    if [[ -f "$main_dir/$CURRENT_APP_CLASS.java" ]]; then
      mv "$main_dir/$CURRENT_APP_CLASS.java" "$main_dir/$NEW_APP_CLASS.java"
    fi

    if [[ -f "$test_dir/${CURRENT_APP_CLASS}Tests.java" ]]; then
      mv "$test_dir/${CURRENT_APP_CLASS}Tests.java" "$test_dir/${NEW_APP_CLASS}Tests.java"
    fi
  fi
}

replace_in_files "$CURRENT_APP_NAME" "$NEW_APP_NAME"
replace_in_files "$CURRENT_PACKAGE" "$NEW_PACKAGE_NAME"
replace_in_files "$CURRENT_APP_CLASS" "$NEW_APP_CLASS"

rename_chart_directory
rename_backend_package_directories
rename_java_app_class

echo "Renaming finished."
