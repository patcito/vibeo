import { resolve, join, basename } from "node:path";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const TEMPLATES: Record<string, { description: string; example: string }> = {
  basic: {
    description: "Minimal composition with text animation and two scenes",
    example: "basic-composition.tsx",
  },
  "audio-reactive": {
    description: "Audio visualization with frequency bars and amplitude-driven effects",
    example: "audio-reactive-viz.tsx",
  },
  transitions: {
    description: "Scene transitions (fade, slide) between multiple scenes",
    example: "transition-demo.tsx",
  },
  subtitles: {
    description: "Video with SRT subtitle overlay",
    example: "subtitle-overlay.tsx",
  },
};

interface CreateArgs {
  name: string;
  template: string;
}

function parseArgs(args: string[]): CreateArgs {
  const result: CreateArgs = { name: "", template: "basic" };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];

    if (arg === "--template" && next) {
      result.template = next;
      i++;
    } else if (arg.startsWith("--template=")) {
      result.template = arg.slice("--template=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith("-") && !result.name) {
      result.name = arg;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
vibeo create - Create a new Vibeo project

Usage:
  vibeo create <project-name> [options]

Options:
  --template <name>   Template to use (default: basic)
  --help              Show this help

Templates:`);

  for (const [name, { description }] of Object.entries(TEMPLATES)) {
    console.log(`  ${name.padEnd(18)} ${description}`);
  }

  console.log(`
Examples:
  vibeo create my-video
  vibeo create music-viz --template audio-reactive
  vibeo create intro --template transitions
`);
}

// Find the examples directory relative to the CLI package
function findExamplesDir(): string {
  // Walk up from this file to find the repo root with examples/
  let dir = import.meta.dir;
  for (let i = 0; i < 6; i++) {
    const candidate = join(dir, "examples");
    if (existsSync(candidate)) return candidate;
    dir = resolve(dir, "..");
  }
  throw new Error("Could not find examples directory");
}

export async function createCommand(args: string[]): Promise<void> {
  const parsed = parseArgs(args);

  if (!parsed.name) {
    console.error("Error: project name is required\n");
    printHelp();
    process.exit(1);
  }

  const template = TEMPLATES[parsed.template];
  if (!template) {
    console.error(`Error: unknown template "${parsed.template}"`);
    console.error(`Available: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  const projectDir = resolve(parsed.name);
  if (existsSync(projectDir)) {
    console.error(`Error: directory "${parsed.name}" already exists`);
    process.exit(1);
  }

  console.log(`\nCreating Vibeo project: ${parsed.name}`);
  console.log(`Template: ${parsed.template}\n`);

  // Create project structure
  await mkdir(join(projectDir, "src"), { recursive: true });
  await mkdir(join(projectDir, "public"), { recursive: true });

  // Copy example as src/index.tsx
  const examplesDir = findExamplesDir();
  const exampleSrc = await readFile(join(examplesDir, template.example), "utf-8");
  await writeFile(join(projectDir, "src", "index.tsx"), exampleSrc);

  // Write package.json
  const pkg = {
    name: parsed.name,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: "vibeo preview --entry src/index.tsx",
      build: "vibeo render --entry src/index.tsx",
      list: "vibeo list --entry src/index.tsx",
      typecheck: "bunx tsc --noEmit",
    },
    dependencies: {
      "@vibeo/core": "workspace:*",
      "@vibeo/audio": "workspace:*",
      "@vibeo/effects": "workspace:*",
      "@vibeo/extras": "workspace:*",
      "@vibeo/player": "workspace:*",
      "@vibeo/renderer": "workspace:*",
      "@vibeo/cli": "workspace:*",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/react": "^19.0.0",
      typescript: "^5.0.0",
    },
  };
  await writeFile(join(projectDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // Write tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      outDir: "dist",
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ["src"],
  };
  await writeFile(join(projectDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2) + "\n");

  // Write .gitignore
  await writeFile(
    join(projectDir, ".gitignore"),
    `node_modules/
dist/
out/
*.tmp
.DS_Store
`,
  );

  console.log(`  Created ${parsed.name}/`);
  console.log(`  ├── src/index.tsx`);
  console.log(`  ├── public/`);
  console.log(`  ├── package.json`);
  console.log(`  ├── tsconfig.json`);
  console.log(`  └── .gitignore`);

  console.log(`
Next steps:
  cd ${parsed.name}
  bun install
  bun run dev        # preview in browser
  bun run build      # render to video
`);
}
