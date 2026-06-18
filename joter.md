{
  "mcpServers": {
    "TiDB": {
      "command": "uvx --from pytidb[mcp] tidb-mcp-server",
      "env": {
        "TIDB_HOST": "gateway01.eu-central-1.prod.aws.tidbcloud.com",
        "TIDB_PORT": "4000",
        "TIDB_USERNAME": "yRkgsdKcjuxuF5a.root",
        "TIDB_PASSWORD": "<PASSWORD>",
        "TIDB_DATABASE": "sys"
      }
    }
  }
}