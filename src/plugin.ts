import { tool, type Plugin } from "@opencode-ai/plugin";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

/**
 * Voice ID for ElevenLabs TTS
 */
const VOICE_ID = "YOq2y2Up4RgXP2HyXjE5";

/**
 * ElevenLabs v3 model ID - most expressive with audio tag support
 */
const MODEL_ID = "eleven_v3";

/**
 * Path to the ElevenLabs API key secret file
 */
const API_KEY_PATH = join(
  process.env.HOME || "~",
  ".config/opencode/secrets/elevenlabs-key"
);

/**
 * Load API key from secrets file
 */
function loadApiKey(): string {
  try {
    return readFileSync(API_KEY_PATH, "utf-8").trim();
  } catch (error) {
    throw new Error(
      `Failed to read ElevenLabs API key from ${API_KEY_PATH}. ` +
        `Please create this file with your API key.`
    );
  }
}

/**
 * Play audio file using macOS afplay (non-blocking)
 */
function playAudio(filePath: string, volume: number): void {
  // Spawn afplay in background (non-blocking)
  const child = spawn("afplay", ["-v", String(volume), filePath], {
    detached: true,
    stdio: "ignore",
  });

  // Unref to allow parent process to exit independently
  child.unref();

  // Clean up temp file after playback completes
  child.on("exit", () => {
    try {
      unlinkSync(filePath);
    } catch {
      // Ignore cleanup errors
    }
  });
}

/**
 * Audio tag categories for reference in tool description
 */
const AUDIO_TAG_EXAMPLES = `
Audio Tags (v3 expressive features):
  Emotions: [laughs], [sighs], [whispers], [excited], [sad], [angry], [happily], [sarcastic], [curious]
  Delivery: [whispers], [shouts], [dramatically], [calmly], [nervously]
  Reactions: [laughs], [laughs harder], [giggles], [clears throat], [sighs], [gasps], [gulps]
  Accents: [strong French accent], [British accent], [Southern US accent]
  Sound FX: [applause], [gunshot], [explosion]

Example: "[whispers] Something's coming... [sighs] I can feel it."
Example: "[excited] We did it! [laughs] I can't believe it worked!"
`;

/**
 * The speak tool definition
 */
const speakTool = tool({
  description: `Convert text to speech using ElevenLabs v3 and play it on the device speakers (non-blocking).

Uses the expressive v3 model which supports inline audio tags for emotional control, 
delivery direction, non-verbal reactions, accents, and sound effects.

${AUDIO_TAG_EXAMPLES}

The audio plays in the background and control returns immediately.

USAGE GUIDANCE:
- Use in SHORT BURSTS to notify the user of important state changes
- Good for: task completion, errors requiring attention, questions needing user input
- Keep messages concise (1-2 sentences) - don't read entire responses aloud
- Examples of when to use:
  * "[excited] Done! The build succeeded."
  * "[curious] I have a question - should I proceed with the refactor?"
  * "[sighs] I found 3 errors we need to fix."
  * "[whispers] Heads up - I'm about to make a breaking change."`,

  args: {
    text: tool.schema
      .string()
      .describe(
        "The text to convert to speech. Can include audio tags like [laughs], [whispers], [excited], etc."
      ),

    stability: tool.schema
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe(
        "Voice stability (0-1). Lower = more expressive/emotional range, higher = more consistent. Default: 0.5"
      ),

    similarity_boost: tool.schema
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe(
        "How closely to match the original voice (0-1). Default: 0.75"
      ),

    speed: tool.schema
      .number()
      .min(0.5)
      .max(2.0)
      .optional()
      .describe("Speech speed multiplier (0.5-2.0). Default: 1.0"),

    volume: tool.schema
      .number()
      .min(0)
      .max(2)
      .optional()
      .describe("Playback volume (0-2). Default: 1.0"),
  },

  async execute(args) {
    const {
      text,
      stability = 0.5,
      similarity_boost = 0.75,
      speed = 1.0,
      volume = 1.0,
    } = args;

    // Load API key from secrets file
    const apiKey = loadApiKey();

    // Call ElevenLabs v3 API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability,
            similarity_boost,
            style: 0,
            use_speaker_boost: true,
            speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ElevenLabs API error (${response.status}): ${errorText}`
      );
    }

    // Save audio to temp file
    const audioBuffer = await response.arrayBuffer();
    const tempFile = join(tmpdir(), `opencode-voice-${Date.now()}.mp3`);
    writeFileSync(tempFile, Buffer.from(audioBuffer));

    // Play audio in background (non-blocking)
    playAudio(tempFile, volume);

    // Return immediately with confirmation
    const preview =
      text.length > 80 ? text.substring(0, 80) + "..." : text;
    return `<speak_started>
Playing speech (non-blocking): "${preview}"
Voice: ${VOICE_ID}
Model: ${MODEL_ID} (v3 expressive)
</speak_started>`;
  },
});

/**
 * The main plugin export
 */
export const VoicePlugin: Plugin = async () => {
  return {
    tool: {
      speak: speakTool,
    },
  };
};
