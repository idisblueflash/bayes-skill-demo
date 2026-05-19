#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="bayesian-hypothesis-live"
SKILL_DIR=".claude/skills/${SKILL_NAME}"
SKILL_FILE="${SKILL_DIR}/SKILL.md"
CHANGELOG_FILE="${SKILL_DIR}/CHANGELOG.md"

# Use argument if provided, otherwise read from SKILL.md frontmatter
if [[ -n "${1:-}" ]]; then
  VERSION="$1"
else
  VERSION=$(grep '^version:' "$SKILL_FILE" | awk '{print $2}' | tr -d '[:space:]')
  if [[ -z "$VERSION" ]]; then
    echo "Error: could not read version from ${SKILL_FILE}" >&2
    exit 1
  fi
fi

TAG="skill-v${VERSION}"
ZIP_NAME="${SKILL_NAME}-v${VERSION}.zip"

echo "Packaging ${SKILL_NAME} v${VERSION}..."

# Build zip from skill folder contents (exclude Python cache)
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" "$SKILL_DIR" -x "*/__pycache__/*" -x "*/*.pyc"
echo "Created ${ZIP_NAME}"

# Extract release notes: content under the current version's ## header
CHANGELOG_NOTES=$(awk "/^## \[${VERSION}\]/{found=1; next} found && /^## \[/{exit} found{print}" "$CHANGELOG_FILE")
if [[ -z "$CHANGELOG_NOTES" ]]; then
  echo "Warning: no CHANGELOG entry found for version ${VERSION}, releasing without notes."
fi

# Append installation instruction in Chinese
INSTALL_INSTRUCTION="## 安裝方式

下載 zip 後，告訴你的 Claude Code：

「幫我安裝這個 skill，zip 檔在這裡：~/Downloads/${ZIP_NAME}」"

NOTES="${CHANGELOG_NOTES}

---

${INSTALL_INSTRUCTION}"

# Create GitHub release and upload zip
echo "Creating GitHub release ${TAG}..."
gh release create "$TAG" "$ZIP_NAME" \
  --title "${SKILL_NAME} v${VERSION}" \
  --notes "$NOTES"

echo "Done: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/${TAG}"

# Clean up local zip
rm "$ZIP_NAME"
