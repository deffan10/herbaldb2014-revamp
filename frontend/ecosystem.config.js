module.exports = {
  apps: [{
    name: 'herbaldb-frontend',
    cwd: '/home/htdocs/herbaldb/frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/htdocs/herbaldb/logs/frontend-error.log',
    out_file: '/home/htdocs/herbaldb/logs/frontend-out.log',
    merge_logs: true,
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
