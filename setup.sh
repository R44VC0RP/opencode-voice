#!/bin/bash

# opencode-voice setup script
# Downloads and configures the OpenCode voice plugin with ElevenLabs v3 TTS

set -e

REPO_URL="https://github.com/R44VC0RP/opencode-voice.git"
INSTALL_DIR="$HOME/dev/opencode-voice"
SECRETS_DIR="$HOME/.config/opencode/secrets"
CONFIG_FILE="$HOME/.config/opencode/opencode.json"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           opencode-voice Setup Script                     ║"
echo "║   ElevenLabs v3 TTS Plugin for OpenCode                   ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check for required tools
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed"
    exit 1
fi

if ! command -v bun &> /dev/null; then
    echo "❌ Error: bun is not installed"
    echo "   Install with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: jq is not installed. Config will need manual update."
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

# Step 1: Clone or update the repository
echo "📦 Step 1: Installing plugin..."
if [ -d "$INSTALL_DIR" ]; then
    echo "   Directory exists, pulling latest..."
    cd "$INSTALL_DIR"
    git pull --quiet
else
    echo "   Cloning repository..."
    mkdir -p "$(dirname "$INSTALL_DIR")"
    git clone --quiet "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
bun install --silent

# Step 3: Get ElevenLabs API key
echo ""
echo "🔑 Step 3: ElevenLabs API Key"
echo "   Get your API key from: https://elevenlabs.io/app/settings/api-keys"
echo ""

# Check if key already exists
if [ -f "$SECRETS_DIR/elevenlabs-key" ]; then
    EXISTING_KEY=$(cat "$SECRETS_DIR/elevenlabs-key")
    if [ "$EXISTING_KEY" != "YOUR_ELEVENLABS_API_KEY_HERE" ] && [ -n "$EXISTING_KEY" ]; then
        echo "   Found existing API key."
        read -p "   Keep existing key? [Y/n]: " KEEP_KEY
        KEEP_KEY=${KEEP_KEY:-Y}
        if [[ $KEEP_KEY =~ ^[Yy]$ ]]; then
            echo "   ✓ Keeping existing key"
            SKIP_KEY=true
        fi
    fi
fi

if [ "$SKIP_KEY" != "true" ]; then
    read -p "   Enter your ElevenLabs API key: " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo "   ⚠️  No key provided. You can add it later to:"
        echo "      $SECRETS_DIR/elevenlabs-key"
    else
        mkdir -p "$SECRETS_DIR"
        echo -n "$API_KEY" > "$SECRETS_DIR/elevenlabs-key"
        chmod 600 "$SECRETS_DIR/elevenlabs-key"
        echo "   ✓ API key saved"
    fi
fi

# Step 4: Update OpenCode config
echo ""
echo "⚙️  Step 4: Configuring OpenCode..."

PLUGIN_PATH="file://$INSTALL_DIR"

if [ -f "$CONFIG_FILE" ]; then
    # Check if plugin is already registered
    if grep -q "opencode-voice" "$CONFIG_FILE"; then
        echo "   ✓ Plugin already registered in config"
    elif [ "$JQ_AVAILABLE" = true ]; then
        # Use jq to add plugin to array
        TMP_FILE=$(mktemp)
        jq --arg plugin "$PLUGIN_PATH" '.plugin += [$plugin]' "$CONFIG_FILE" > "$TMP_FILE"
        mv "$TMP_FILE" "$CONFIG_FILE"
        echo "   ✓ Plugin added to config"
    else
        echo "   ⚠️  Please manually add this to your opencode.json plugin array:"
        echo "      \"$PLUGIN_PATH\""
    fi
else
    # Create new config file
    mkdir -p "$(dirname "$CONFIG_FILE")"
    cat > "$CONFIG_FILE" << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "plugin": [
    "$PLUGIN_PATH"
  ]
}
EOF
    echo "   ✓ Created new config with plugin"
fi

# Done!
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Plugin installed to: $INSTALL_DIR"
echo "🔑 API key stored in:   $SECRETS_DIR/elevenlabs-key"
echo "⚙️  Config file:         $CONFIG_FILE"
echo ""
echo "🚀 Restart OpenCode to use the 'speak' tool!"
echo ""
echo "   Example usage:"
echo "   speak(\"[excited] Hello! [laughs] This is amazing!\")"
echo ""
