module.exports = {
  apps: [
    {
      name: "kusystem-frontend",
      cwd: __dirname,
      script: "npm",
      args: "run preview -- --port 5173 --host",
      interpreter: "none",
      windowsHide: true,
      autorestart: true,
      restart_delay: 3000,
      env: { NODE_ENV: "production" }
    }
  ]
}
