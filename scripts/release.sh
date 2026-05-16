#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="bayesian-hypothesis-live"
SKILL_DIR=".claude/skills/${SKILL_NAME}"
SKILL_FILE="${SKILL_DIR}/SKILL.md"
CHANGELOG_FILE="${SKILL_DIR}/CHANGELOG.md"

# Read version from SKILL.md frontmatter
VERSION=$(grep '^version:' "$SKILL_FILE" | awk '{print $2}' | tr -d '[:space:]')
if [[ -z "$VERSION" ]]; then
  echo "Error: could not read version from ${SKILL_FILE}" >&2
  exit 1
fi

TAG="skill-v${VERSION}"
ZIP_NAME="${SKILL_NAME}-v${VERSION}.zip"

echo "Packaging ${SKILL_NAME} v${VERSION}..."

# Build zip from skill folder contents
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" "$SKILL_DIR"
echo "Created ${ZIP_NAME}"

# Extract release notes: content under the current version's ## header
NOTES=$(awk "/^## \[${VERSION}\]/{found=1; next} found && /^## \[/{exit} found{print}" "$CHANGELOG_FILE")
if [[ -z "$NOTES" ]]; then
  echo "Warning: no CHANGELOG entry found for version ${VERSION}, releasing without notes."
fi

# Create GitHub release and upload zip
echo "Creating GitHub release ${TAG}..."
gh release create "$TAG" "$ZIP_NAME" \
  --title "${SKILL_NAME} v${VERSION}" \
  --notes "$NOTES"

echo "Done: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/${TAG}"

# Clean up local zip
rm "$ZIP_NAME"
