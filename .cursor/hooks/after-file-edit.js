#!/usr/bin/env node
const { readStdin, runExistingHook, transformToClaude } = require('./adapter');
readStdin()
  .then((raw) => {
    try {
      const input = JSON.parse(raw);
      const claudeInput = transformToClaude(input, {
        tool_input: { file_path: input.path || input.file || '' },
      });
      const claudeStr = JSON.stringify(claudeInput);

      // Run format, typecheck, console.log warning, and API doc reminder sequentially
      runExistingHook('post-edit-format.js', claudeStr);
      runExistingHook('post-edit-typecheck.js', claudeStr);
      runExistingHook('post-edit-console-warn.js', claudeStr);
      runExistingHook('post-edit-api-doc-reminder.js', claudeStr);
    } catch {}
    process.stdout.write(raw);
  })
  .catch(() => process.exit(0));
