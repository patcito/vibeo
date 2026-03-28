import { resolve, join, dirname } from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";

// ---------------------------------------------------------------------------
// Embedded skill content (so it works from npm without the skills/ dir)
// ---------------------------------------------------------------------------

async function loadSkills(): Promise<Record<string, string>> {
  // Try to load from the repo's skills/ directory first
  const candidates = [
    join(dirname(import.meta.url.replace("file://", "")), "../../../../skills"),
    join(process.cwd(), "skills"),
  ];

  for (const dir of candidates) {
    const names = ["vibeo-core", "vibeo-audio", "vibeo-effects", "vibeo-extras", "vibeo-rendering"];
    const skills: Record<string, string> = {};
    let found = true;

    for (const name of names) {
      const path = join(dir, name, "SKILL.md");
      if (existsSync(path)) {
        skills[name] = await readFile(path, "utf-8");
      } else {
        found = false;
        break;
      }
    }

    if (found) return skills;
  }

  // Fallback: generate a minimal combined skill from --llms-full output
  return {
    vibeo: getEmbeddedSkill(),
  };
}

function getEmbeddedSkill(): string {
  return `# Vibeo — React Video Framework

Vibeo is a React-based programmatic video framework. Write video compositions as React components, preview in the browser, and render to video with FFmpeg.

## Quick Reference

\`\`\`bash
# Get full CLI docs
bunx @vibeo/cli --llms-full

# Create a project
bunx @vibeo/cli create my-video --template basic

# Preview
bunx @vibeo/cli preview --entry src/index.tsx

# Render
bunx @vibeo/cli render --entry src/index.tsx --composition MyComp

# List compositions
bunx @vibeo/cli list --entry src/index.tsx
\`\`\`

## Packages

- \`@vibeo/core\` — Composition, Sequence, Loop, useCurrentFrame, useVideoConfig, interpolate, easing
- \`@vibeo/audio\` — Audio/Video components, 48kHz sync, volume curves, audio mixing
- \`@vibeo/effects\` — useKeyframes, useSpring, Transition (fade/wipe/slide/dissolve), useAudioData
- \`@vibeo/extras\` — Subtitle (SRT/VTT), AudioWaveform, AudioSpectrogram, SceneGraph, AudioMix
- \`@vibeo/player\` — Interactive Player component with controls
- \`@vibeo/renderer\` — Headless rendering via Playwright + FFmpeg
- \`@vibeo/cli\` — CLI with incur (supports --llms, --mcp, --schema)

## Core Pattern

\`\`\`tsx
import { Composition, Sequence, VibeoRoot, useCurrentFrame, useVideoConfig, interpolate } from "@vibeo/core";

function MyScene() {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  return <div style={{ width, height, opacity }}>Hello</div>;
}

export function Root() {
  return (
    <VibeoRoot>
      <Composition id="MyComp" component={MyScene} width={1920} height={1080} fps={30} durationInFrames={150} />
    </VibeoRoot>
  );
}
\`\`\`

## Key Math

- Frame to time: \`time = frame / fps\`
- Samples per frame (audio): \`(48000 * 2) / fps\`
- Media time with playback rate: uses interpolation with rate scaling
- Sequence relative frame: \`absoluteFrame - (cumulatedFrom + relativeFrom)\`
- Loop iteration: \`floor(currentFrame / durationInFrames)\`

For full API details, run \`bunx @vibeo/cli --llms-full\` or \`bunx @vibeo/cli <command> --schema\`.
`;
}

// ---------------------------------------------------------------------------
// LLM tool targets
// ---------------------------------------------------------------------------

interface Target {
  name: string;
  description: string;
  install: (skills: Record<string, string>, cwd: string) => Promise<string[]>;
}

const home = homedir();

const TARGETS: Target[] = [
  {
    name: "claude",
    description: "Claude Code (~/.claude/skills/ + project CLAUDE.md)",
    async install(skills, cwd) {
      const files: string[] = [];

      // Global skills directory
      const globalDir = join(home, ".claude", "skills");
      await mkdir(globalDir, { recursive: true });
      for (const [name, content] of Object.entries(skills)) {
        const path = join(globalDir, `${name}.md`);
        await writeFile(path, content);
        files.push(path);
      }

      // Project-level .claude/skills/
      const projectDir = join(cwd, ".claude", "skills");
      await mkdir(projectDir, { recursive: true });
      for (const [name, content] of Object.entries(skills)) {
        const path = join(projectDir, `${name}.md`);
        await writeFile(path, content);
        files.push(path);
      }

      return files;
    },
  },
  {
    name: "codex",
    description: "OpenAI Codex CLI (project AGENTS.md)",
    async install(skills, cwd) {
      const combined = Object.values(skills).join("\n\n---\n\n");
      const path = join(cwd, "AGENTS.md");
      const header = "# Vibeo — Agent Instructions\n\nThis file is auto-generated by `vibeo install-skills`. It helps Codex CLI understand the Vibeo framework.\n\n";
      await writeFile(path, header + combined);
      return [path];
    },
  },
  {
    name: "cursor",
    description: "Cursor (.cursor/rules/*.mdc)",
    async install(skills, cwd) {
      const dir = join(cwd, ".cursor", "rules");
      await mkdir(dir, { recursive: true });
      const files: string[] = [];
      for (const [name, content] of Object.entries(skills)) {
        const mdcContent = `---\ndescription: ${name} skill for Vibeo video framework\nglobs: **/*.{ts,tsx}\nalwaysApply: false\n---\n\n${content}`;
        const path = join(dir, `${name}.mdc`);
        await writeFile(path, mdcContent);
        files.push(path);
      }
      return files;
    },
  },
  {
    name: "gemini",
    description: "Gemini CLI (GEMINI.md)",
    async install(skills, cwd) {
      const combined = Object.values(skills).join("\n\n---\n\n");
      const path = join(cwd, "GEMINI.md");
      const header = "# Vibeo — Gemini Instructions\n\nThis file is auto-generated by `vibeo install-skills`. It helps Gemini CLI understand the Vibeo framework.\n\n";
      await writeFile(path, header + combined);
      return [path];
    },
  },
  {
    name: "opencode",
    description: "OpenCode (AGENTS.md)",
    async install(skills, cwd) {
      // OpenCode also reads AGENTS.md — same as codex, but we don't double-write
      const path = join(cwd, "AGENTS.md");
      if (existsSync(path)) return []; // Already written by codex target
      const combined = Object.values(skills).join("\n\n---\n\n");
      const header = "# Vibeo — Agent Instructions\n\nThis file is auto-generated by `vibeo install-skills`. It helps AI agents understand the Vibeo framework.\n\n";
      await writeFile(path, header + combined);
      return [path];
    },
  },
  {
    name: "aider",
    description: "Aider (.aider.conf.yml conventions file reference)",
    async install(skills, cwd) {
      const combined = Object.values(skills).join("\n\n---\n\n");
      const path = join(cwd, ".aider.vibeo.md");
      await writeFile(path, combined);
      return [path];
    },
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function installSkills(
  targets: string[],
  cwd: string,
): Promise<{ installed: Record<string, string[]> }> {
  const skills = await loadSkills();
  const installed: Record<string, string[]> = {};

  const selectedTargets =
    targets.length === 0
      ? TARGETS // all
      : TARGETS.filter((t) => targets.includes(t.name));

  if (selectedTargets.length === 0) {
    throw new Error(
      `No matching targets. Available: ${TARGETS.map((t) => t.name).join(", ")}`,
    );
  }

  for (const target of selectedTargets) {
    const files = await target.install(skills, cwd);
    if (files.length > 0) {
      installed[target.name] = files;
    }
  }

  return { installed };
}

export const AVAILABLE_TARGETS = TARGETS.map((t) => ({
  name: t.name,
  description: t.description,
}));
