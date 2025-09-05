module.exports = {
  apps: [
    {
      name: "kusystem-frontend",
      cwd: __dirname,
      script: "node",
      args: "./node_modules/vite/bin/vite.js dev --port 5174",
      interpreter: "none",
      windowsHide: true,
      autorestart: true,
      restart_delay: 3000,
      env: { NODE_ENV: "development" }
    }
  ]
}
