# OpenCode Voice Plugin - Agent Knowledge

## ElevenLabs v3 API

- Model ID is `eleven_v3` (not `eleven_v3_alpha` or `elevenlabs_v3`) - use in `model_id` field
- Audio tags must be lowercase in square brackets: `[whispers]` not `[Whispers]` or `[WHISPERS]`
- Output format `mp3_44100_128` is passed as query param, not in request body: `?output_format=mp3_44100_128`
- API returns raw binary audio stream, not JSON - use `response.arrayBuffer()` directly

## OpenCode Plugin Architecture

- Plugin entry point (`index.ts`) must export named export matching plugin name: `export { VoicePlugin }`
- `.ts` extension required in imports when using `allowImportingTsExtensions: true` in tsconfig
- API keys pattern: read from `~/.config/opencode/secrets/{service}-key` (not env vars for user plugins)
- `tool.schema` is Zod - use `.string()`, `.number()`, `.optional()` - NOT TypeScript types

## macOS Audio Playback

- `afplay` is non-blocking by default ONLY if spawned with `detached: true` and `child.unref()`
- Without `unref()`, parent process waits for audio completion even with `detached: true`
- Volume in `afplay -v` is 0-255 scale, but represent to users as 0-2 for intuitive control
- Temp file cleanup: attach to child process `exit` event, not `close` (more reliable)

## Setup Script Best Practices

- Use `set -e` to fail fast on any error in bash scripts
- Check for `jq` availability before attempting JSON manipulation - provide manual fallback
- Use `mkdir -p` for secrets dir - may not exist on fresh OpenCode installs
- `chmod 600` on API key files for security (user-only read/write)
- Git operations: use `--quiet` flag to reduce noise in setup scripts

## File Changes That Must Happen Together

- `setup.sh` and `README.md` both contain repo URL - update both when changing GitHub org/username
- When changing voice ID: `src/plugin.ts` VOICE_ID constant + README.md configuration section
