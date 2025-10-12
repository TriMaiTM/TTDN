#!/bin/sh
set -e

ENV_FILE="src/environments/firebase.config.prod.ts"

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE not found!"
  exit 1
fi

VARS=$(grep -o '#{[^}]*}#' "$ENV_FILE" | sed 's/[#{}]//g')

for VAR in $VARS; do
  VALUE=$(eval echo \$$VAR)
  if [ -z "$VALUE" ]; then
    echo "Variable $VAR not defined"
  else
    sed -i "s|#{$VAR}#|$VALUE|g" "$ENV_FILE"
    echo "replaced #{$VAR}# by $VALUE"
  fi
done