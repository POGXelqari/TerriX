#!/usr/bin/env bash
# ==============================================================================
# Clan Bank Manager (CBM) — Android Native Release APK Builder
# Designed for Google Colab (OpenJDK 17, Android SDK 34, Gradle 8.5)
# ==============================================================================

set -e

echo "=========================================================="
echo "Clan Bank Manager (CBM) Android Release APK Build Pipeline"
echo "=========================================================="

export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export PATH="$ANDROID_HOME/build-tools/34.0.0:$ANDROID_HOME/platform-tools:$PATH"

echo "[1/5] Verifying Build Toolchain..."
java -version
gradle -version
echo "Android SDK: $ANDROID_HOME"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

cd "$ANDROID_DIR"

echo "[2/5] Creating / Verifying Release Keystore..."
KEYSTORE="$ANDROID_DIR/release-key.jks"
KEY_ALIAS="cbm"
KEY_PASS="cbm12345"

if [ ! -f "$KEYSTORE" ]; then
    keytool -genkey -v \
        -keystore "$KEYSTORE" \
        -alias "$KEY_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$KEY_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=Clan Bank Manager, OU=Mobile, O=Wispbyte, L=Internet, ST=Global, C=US"
    echo "Generated release keystore: $KEYSTORE"
else
    echo "Found existing keystore: $KEYSTORE"
fi

echo "[3/5] Compiling Android Release Package with Gradle 8.5..."
gradle assembleRelease --no-daemon --stacktrace

UNSIGNED_APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
if [ ! -f "$UNSIGNED_APK" ]; then
    UNSIGNED_APK="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
fi

echo "[4/5] Aligning & Cryptographically Signing APK..."
ALIGNED_APK="$PROJECT_DIR/ClanBankManager-aligned.apk"
FINAL_APK="$PROJECT_DIR/ClanBankManager-release.apk"

zipalign -f -v 4 "$UNSIGNED_APK" "$ALIGNED_APK"

apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias "$KEY_ALIAS" \
    --ks-pass "pass:$KEY_PASS" \
    --key-pass "pass:$KEY_PASS" \
    --out "$FINAL_APK" \
    "$ALIGNED_APK"

echo "[5/5] Extracting SHA-256 Certificate Fingerprint for Digital Asset Links..."
SHA256=$(keytool -list -v -keystore "$KEYSTORE" -alias "$KEY_ALIAS" -storepass "$KEY_PASS" | grep "SHA256:" | awk '{print $2}')

echo "=========================================================="
echo " BUILD SUCCESSFUL!"
echo " Output Release APK: $FINAL_APK"
echo " Certificate SHA256: $SHA256"
echo " Note: Set ANDROID_RELEASE_SHA256=$SHA256 on CBM server"
echo "=========================================================="
