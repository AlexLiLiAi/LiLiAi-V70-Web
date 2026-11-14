LiLiAi V70 — Android build setup

This package contains only Android build configuration, not website assets.
Upload to the ROOT of the existing GitHub repository, preserving paths:
- package.json
- capacitor.config.json
- scripts/prepare-web.js
- .github/workflows/build-android.yml

The workflow builds an installable DEBUG APK for testing and uploads it as a GitHub Actions artifact.
This is not a Play Store release/signing setup.
