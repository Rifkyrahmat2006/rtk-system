module.exports = {
  apps: [{
    name: "rtk-mcp",
    script: "server/mcp-http.js",
    interpreter: "node",
    watch: false,
    autorestart: true,
    max_restarts: 10,
    env: { NODE_ENV: "production" },
  }],
};
