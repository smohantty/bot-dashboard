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

echo "Uninstalling Trading Bot Dashboard..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing application files..."
    rm -rf "$INSTALL_DIR"
fi

# Remove desktop file
if [ -f "$DESKTOP_FILE" ]; then
    echo "Removing desktop entry..."
    rm -f "$DESKTOP_FILE"
fi

# Remove icons
echo "Removing icons..."
for size in 16 32 48 64 128 256 512 1024; do
    ICON_FILE="$ICON_DIR/${size}x${size}/apps/$APP_NAME.png"
    if [ -f "$ICON_FILE" ]; then
        rm -f "$ICON_FILE"
    fi
done

# Update icon cache
gtk-update-icon-cache -f -t "$ICON_DIR" 2>/dev/null || true

# Update desktop database
update-desktop-database /usr/share/applications 2>/dev/null || true

echo -e "${GREEN}Uninstallation complete!${NC}"
