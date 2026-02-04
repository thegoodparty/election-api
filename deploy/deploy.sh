#!/bin/sh
set -e

env="$1"
if [ -z "$env" ]; then
  echo "Usage: deploy.sh <env>"
  exit 1
fi

if [ -z "$IMAGE_URI" ]; then
  echo "Error: IMAGE_URI is not set"
  exit 1
fi

# Fetch Pulumi passphrase from SSM
PULUMI_CONFIG_PASSPHRASE=$(aws ssm get-parameter \
  --name "pulumi-state-config-passphrase" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)

if [ -z "$PULUMI_CONFIG_PASSPHRASE" ]; then
  echo "Error: Failed to pull pulumi state config passphrase from SSM"
  exit 1
fi

export PULUMI_CONFIG_PASSPHRASE

pulumi login s3://goodparty-iac-state
pulumi stack select "organization/election-api/election-api-$env" --create
pulumi config set aws:region "$AWS_REGION"
pulumi config set environment "$env"
pulumi config set imageUri "$IMAGE_URI"
pulumi config set --path aws:defaultTags.tags.Environment "$env"
pulumi config set --path aws:defaultTags.tags.Project election-api

if [ "$CI" = "true" ]; then
  pulumi up --diff --yes
else
  pulumi preview --diff
fi