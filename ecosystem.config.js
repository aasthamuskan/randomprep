// PM2 Ecosystem Config — Production Process Manager
// Usage: pm2 start ecosystem.config.js --env production
// Docs:  https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'randomprep-api',
      script: 'index.js',
      cwd: './server',

      // Cluster mode — use all CPU cores
      instances: 'max',
      exec_mode: 'cluster',

      // Auto-restart config
      watch: false,                    // No file watching in prod
      max_memory_restart: '300M',      // Restart if memory exceeds 300MB
      restart_delay: 3000,             // Wait 3s between restarts

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,

      // Environment variables per mode
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};