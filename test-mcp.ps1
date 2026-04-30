$headers = @{ "Content-Type" = "application/json"; "Accept" = "application/json, text/event-stream" }

function mcpCall($body) {
  $r = Invoke-WebRequest -Uri "http://localhost:3000/mcp" -Method POST -Headers $headers -Body $body
  return $r.Content
}

# 1. tools/list — verify 5 tools
Write-Host "=== tools/list ===" -ForegroundColor Cyan
$res = mcpCall '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
$tools = ($res | ConvertFrom-Json -ErrorAction SilentlyContinue)
# just print tool names
$res -split "`n" | Where-Object { $_ -match '"name"' } | ForEach-Object { Write-Host $_ }

# 2. rtk_read with lineStart/lineEnd
Write-Host "`n=== rtk_read with line range (1-10) ===" -ForegroundColor Cyan
$res2 = mcpCall '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"rtk_read","arguments":{"project":"smartani","file":"composer.json","lineStart":1,"lineEnd":10}}}'
Write-Host ($res2 -replace 'data: ','')

# 3. rtk_cache_clear
Write-Host "`n=== rtk_cache_clear ===" -ForegroundColor Cyan
$res3 = mcpCall '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"rtk_cache_clear","arguments":{"project":"smartani"}}}'
Write-Host ($res3 -replace 'data: ','')
