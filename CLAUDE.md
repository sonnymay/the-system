# Claude Code Setup

## Caveman

[Caveman](https://github.com/JuliusBrussee/caveman) is installed in this project's Claude Code environment. It reduces LLM output tokens by ~65-75% through terse communication while keeping technical accuracy intact.

### Install

Run the one-liner to install caveman hooks into your local Claude Code:

**macOS / Linux / WSL:**
```bash
bash <(curl -s https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/install.sh)
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/install.ps1 | iex
```

Restart Claude Code after installing.

### What gets installed

- `~/.claude/hooks/caveman-config.js` — caveman rules loader
- `~/.claude/hooks/caveman-activate.js` — session activation
- `~/.claude/hooks/caveman-mode-tracker.js` — tracks mode switches
- `~/.claude/hooks/caveman-statusline.sh` — statusline badge

Hooks wired in `~/.claude/settings.json`:
- **SessionStart** — auto-loads caveman rules every session
- **UserPromptSubmit** — updates badge when mode changes

### Usage

| Command | Effect |
|---|---|
| `/caveman` | Toggle caveman mode on/off |
| `/caveman lite` | Mild compression |
| `/caveman ultra` | Maximum compression |
| `/caveman-commit` | Terse commit messages |
| `/caveman-review` | One-line code reviews |

The statusline shows `[CAVEMAN]` or `[CAVEMAN:ULTRA]` when active.

### Uninstall

```bash
bash <(curl -s https://raw.githubusercontent.com/JuliusBrussee/caveman/main/hooks/uninstall.sh)
```
