#!/bin/bash

# Check for required arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <workspace-name> <version-bump-type>"
    echo "Bump types: major, minor, patch"
    echo "Example: $0 packageA patch"
    exit 1
fi

# Arguments
WORKSPACE=$1
BUMP_TYPE=$2

# Root directory of the monorepo
ROOT_DIR=$(pwd)

# Workspace directory
WORKSPACE_DIR="$ROOT_DIR/packages/$WORKSPACE"

# Check for the existence of the workspace directory
if [ ! -d "$WORKSPACE_DIR" ]; then
    echo "Error: Workspace $WORKSPACE not found!"
    exit 1
fi

# Navigate to workspace directory
cd "$WORKSPACE_DIR"

# Bump version without creating a Git tag
yarn version --$BUMP_TYPE --no-git-tag-version

# Get new version from package.json
NEW_VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')

# Commit and push changes
git add package.json
git commit -m "$WORKSPACE: bump to $NEW_VERSION"
git push origin HEAD

# Create a namespaced Git tag
git tag "$WORKSPACE@$NEW_VERSION"
git push origin "$WORKSPACE@$NEW_VERSION"

# Publish the package
yarn publish --access public

# Return to root
cd "$ROOT_DIR"

echo "Published $WORKSPACE@$NEW_VERSION"
