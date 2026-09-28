/**
 * PreToolUse: stop agents reading secrets.
 *
 * Shared by Claude Code (.claude/settings.json) and Cursor (.cursor/hooks.json).
 * Exit code 2 blocks the tool call and shows stderr to the agent; any other
 * failure would let the read through, so bad input also exits 2.
 */

interface HookInput {
  tool_name?: string;
  tool_input?: {
    command?: string;
    file_path?: string;
    glob?: string;
    path?: string;
    pattern?: string;
  };
}

// Patterns anchor on a path boundary so `process.env.X` or `obj.key` in a
// shell one-liner is not mistaken for a file.
const BLOCKED: { pattern: RegExp; msg: string }[] = [
  {
    msg: "Env files hold secrets. Read `.env.example` for the variable names.",
    pattern: /(?:^|[\s/'"=*])\.env(?!\.example)(?:$|[\s.'"*])/u,
  },
  {
    msg: "Use git CLI commands instead.",
    pattern: /(?:^|[\s/'"])\.git\//u,
  },
  {
    msg: "Key and certificate files are blocked.",
    pattern: /\.(?:pem|key|pfx|p12)(?=$|[\s'"])/u,
  },
  { msg: "Credentials files are blocked.", pattern: /credentials\.json/u },
  { msg: "SSH keys are blocked.", pattern: /id_(?:rsa|ed25519|ecdsa)/u },
  {
    msg: "Registry auth tokens are blocked.",
    pattern: /(?:^|\/)\.npmrc\b/u,
  },
  { msg: "Terraform variable files are blocked.", pattern: /\.tfvars\b/u },
];

function block(msg: string): never {
  console.error(`Blocked: ${msg}`);
  process.exit(2);
}

async function readInput(): Promise<HookInput> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString()) as HookInput;
  } catch {
    return block("hook received invalid JSON input.");
  }
}

const { tool_input: toolInput = {} } = await readInput();

// Read/Grep/Glob name paths directly; Bash can reach the same files via `cat`.
const targets = [
  toolInput.file_path,
  toolInput.path,
  toolInput.glob,
  toolInput.command,
].filter((value): value is string => Boolean(value));

for (const target of targets) {
  if (target !== toolInput.command && target.includes("..")) {
    block("path traversal detected.");
  }
  for (const { pattern, msg } of BLOCKED) {
    if (pattern.test(target)) {
      block(msg);
    }
  }
}
