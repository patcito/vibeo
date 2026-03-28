import { renderCommand } from "./commands/render.js";
import { previewCommand } from "./commands/preview.js";
import { listCommand } from "./commands/list.js";
import { createCommand } from "./commands/create.js";

const args = process.argv.slice(2);
const command = args[0];

function printUsage(): void {
  console.log(`
vibeo - React video framework CLI

Usage:
  vibeo <command> [options]

Commands:
  create    Create a new project from a template
  render    Render a composition to video
  preview   Start a dev server with live preview
  list      List registered compositions

Options:
  --help    Show help for a command

Examples:
  vibeo create my-video
  vibeo create music-viz --template audio-reactive
  vibeo render --entry src/index.tsx --composition MyComp --output out.mp4
  vibeo preview --entry src/index.tsx
  vibeo list --entry src/index.tsx
`);
}

async function main(): Promise<void> {
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case "create":
      await createCommand(args.slice(1));
      break;
    case "render":
      await renderCommand(args.slice(1));
      break;
    case "preview":
      await previewCommand(args.slice(1));
      break;
    case "list":
      await listCommand(args.slice(1));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
