#!/bin/bash
set -e

APP_NAME="trading-bot-dashboard"
INSTALL_DIR="/opt/$APP_NAME"
DESKTOP_FILE="/usr/share/applications/$APP_NAME.desktop"
ICON_DIR="/usr/share/icons/hicolor"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Installing Trading Bot Dashboard..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Find the AppImage
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPIMAGE="$SCRIPT_DIR/dist/$APP_NAME-1.0.0.AppImage"

if [ ! -f "$APPIMAGE" ]; then
    echo -e "${RED}AppImage not found at $APPIMAGE${NC}"
    echo "Please run 'npm run electron:build' first."
    exit 1
fi

# Remove old installation if exists
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing old installation..."
    rm -rf "$INSTALL_DIR"
fi

# Create installation directory
mkdir -p "$INSTALL_DIR"

# Extract AppImage
echo "Extracting AppImage..."
cd "$INSTALL_DIR"
chmod +x "$APPIMAGE"
"$APPIMAGE" --appimage-extract > /dev/null 2>&1
mv squashfs-root/* .
rm -rf squashfs-root

# Fix permissions for all users
chmod -R a+rX "$INSTALL_DIR"
chmod a+x "$INSTALL_DIR/$APP_NAME"

# Install icons
echo "Installing icons..."
for size in 16 32 48 64 128 256 512 1024; do
    ICON_SIZE_DIR="$ICON_DIR/${size}x${size}/apps"
    mkdir -p "$ICON_SIZE_DIR"
    if [ -f "$INSTALL_DIR/usr/share/icons/hicolor/${size}x${size}/apps/$APP_NAME.png" ]; then
        cp "$INSTALL_DIR/usr/share/icons/hicolor/${size}x${size}/apps/$APP_NAME.png" "$ICON_SIZE_DIR/"
    elif [ -f "$INSTALL_DIR/$APP_NAME.png" ]; then
        cp "$INSTALL_DIR/$APP_NAME.png" "$ICON_SIZE_DIR/"
    fi
done

# Create desktop file
echo "Creating desktop entry..."
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=Trading Bot Dashboard
Comment=Multi-Exchange Trading Bot Dashboard
Exec=$INSTALL_DIR/$APP_NAME --no-sandbox %U
Icon=$APP_NAME
Terminal=false
Type=Application
Categories=Finance;
StartupWMClass=$APP_NAME
EOF

# Update icon cache
echo "Updating icon cache..."
gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true

# Update desktop database
update-desktop-database /usr/share/applications 2>/dev/null || true

echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "You can now:"
echo "  1. Find 'Trading Bot Dashboard' in your application menu"
echo "  2. Pin it to your dock/favorites"
echo ""
echo "To uninstall, run: sudo ./uninstall.sh"
