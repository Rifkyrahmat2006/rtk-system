@echo off
echo Testing RTK MCP v4.0 Server
echo.

echo 1. Testing rtk_index_stats...
curl -X POST http://localhost:3000/mcp ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json, text/event-stream" ^
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"rtk_index_stats\",\"arguments\":{\"project\":\"smartani\"}}}"
echo.
echo.

echo 2. Testing rtk_semantic_search...
curl -X POST http://localhost:3000/mcp ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json, text/event-stream" ^
  -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"rtk_semantic_search\",\"arguments\":{\"project\":\"smartani\",\"query\":\"authentication login\",\"topK\":3}}}"
echo.
echo.

echo Done!
