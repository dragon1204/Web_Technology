// PM2 Ecosystem file để quản lý app tốt hơn
module.exports = {
  apps: [{
    name: 'be-server',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    // Restart nếu crash
    min_uptime: '10s',
    max_restarts: 10
  }]
};

