# MCP Client Configuration Example

This example shows how to configure an MCP client (like Claude Desktop) to use the browserslist-mcp server.

## Configuration for Claude Desktop

Add the following to your Claude Desktop configuration file:

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**

```json
{
  "mcpServers": {
    "browserslist": {
      "command": "node",
      "args": ["/absolute/path/to/browserslist-mcp/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/browserslist-mcp` with the actual path to your installation.

## Using npx (if published to npm)

```json
{
  "mcpServers": {
    "browserslist": {
      "command": "npx",
      "args": ["-y", "browserslist-mcp"]
    }
  }
}
```

## Example Usage

Once configured, you can use the browserslist server in Claude Desktop:

1. **Query browsers:**
   - "What browsers match 'last 2 versions'?"
   - "Execute browserslist query '> 1% and not dead'"

2. **Get documentation:**
   - "Show me the browserslist documentation"
   - "How do I write browserslist queries?"

3. **Get coverage:**
   - "What's the coverage for Chrome 90 and Firefox 88?"

4. **Get defaults:**
   - "What are the default browserslist settings?"
