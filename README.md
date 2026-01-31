# opencode-voice

An [OpenCode](https://opencode.ai) plugin that adds text-to-speech capabilities using [ElevenLabs](https://elevenlabs.io) v3 with expressive audio tags.

https://x.com/placeholder-demo-link

## Features

- **ElevenLabs v3** - Uses the most expressive TTS model with audio tag support
- **Audio Tags** - Control emotions, delivery, reactions, accents, and sound effects inline
- **Non-blocking** - Audio plays in background, control returns immediately
- **macOS Native** - Uses `afplay` for reliable audio playback

## Quick Install

Run this one-liner to install and configure everything:

```bash
curl -fsSL https://raw.githubusercontent.com/R44VC0RP/opencode-voice/main/setup.sh | bash
```

The setup script will:
- Clone the plugin to `~/dev/opencode-voice`
- Install dependencies
- Prompt for your ElevenLabs API key
- Update your OpenCode config

Then restart OpenCode!

## Manual Installation

<details>
<summary>Click to expand manual steps</summary>

1. Clone or download this plugin:
```bash
git clone https://github.com/R44VC0RP/opencode-voice.git ~/dev/opencode-voice
cd ~/dev/opencode-voice
bun install
```

2. Add your ElevenLabs API key:
```bash
mkdir -p ~/.config/opencode/secrets
echo "YOUR_API_KEY" > ~/.config/opencode/secrets/elevenlabs-key
```

3. Register the plugin in your OpenCode config (`~/.config/opencode/opencode.json`):
```json
{
  "plugin": [
    "file:///Users/YOUR_USERNAME/dev/opencode-voice"
  ]
}
```

4. Restart OpenCode

</details>

## Usage

The plugin provides a `speak` tool that converts text to speech with expressive audio tags:

```
speak("[excited] Hello! [laughs] This is amazing!")
speak("[whispers] Something's coming... [sighs] I can feel it.")
speak("[dramatically] The code is complete.")
```

### Audio Tags

ElevenLabs v3 supports inline audio tags for precise control:

| Category | Examples |
|----------|----------|
| **Emotions** | `[laughs]`, `[sighs]`, `[excited]`, `[sad]`, `[angry]`, `[happily]`, `[sarcastic]`, `[curious]` |
| **Delivery** | `[whispers]`, `[shouts]`, `[dramatically]`, `[calmly]`, `[nervously]` |
| **Reactions** | `[laughs harder]`, `[giggles]`, `[clears throat]`, `[gasps]`, `[gulps]` |
| **Accents** | `[strong French accent]`, `[British accent]`, `[Southern US accent]` |
| **Sound FX** | `[applause]`, `[gunshot]`, `[explosion]` |

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | required | Text with optional audio tags |
| `stability` | 0-1 | 0.5 | Lower = more expressive |
| `similarity_boost` | 0-1 | 0.75 | Voice similarity |
| `speed` | 0.5-2.0 | 1.0 | Speech speed |
| `volume` | 0-2 | 1.0 | Playback volume |

### Best Practices

- Use in **short bursts** to notify the user of important state changes
- Good for: task completion, errors requiring attention, questions needing user input
- Keep messages **concise** (1-2 sentences) - don't read entire responses aloud

Examples:
- `[excited] Done! The build succeeded.`
- `[curious] I have a question - should I proceed with the refactor?`
- `[sighs] I found 3 errors we need to fix.`
- `[whispers] Heads up - I'm about to make a breaking change.`

## Configuration

### Voice ID

The default voice ID is `YOq2y2Up4RgXP2HyXjE5`. To use a different voice, edit `src/plugin.ts`:

```typescript
const VOICE_ID = "your-voice-id-here";
```

### API Key

The plugin reads the ElevenLabs API key from:
```
~/.config/opencode/secrets/elevenlabs-key
```

## Requirements

- macOS (uses `afplay` for audio playback)
- [Bun](https://bun.sh) runtime
- ElevenLabs API key with v3 access

## License

MIT
