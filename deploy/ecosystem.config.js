// PM2 Ecosystem Configuration
// Usage: pm2 start ecosystem.config.js

module.exports = {
    apps: [
        {
            name: 'bookease-backend',
            cwd: '/home/ubuntu/booking/backend',
            script: 'dist/server.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            // Auto-restart on crash
            max_restarts: 10,
            restart_delay: 5000,
            // Logging
            error_file: '/home/ubuntu/logs/backend-error.log',
            out_file: '/home/ubuntu/logs/backend-out.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
        {
            name: 'bookease-frontend',
            cwd: '/home/ubuntu/booking/frontend',
            script: 'node_modules/.bin/next',
            args: 'start -p 3000',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            max_restarts: 10,
            restart_delay: 5000,
            error_file: '/home/ubuntu/logs/frontend-error.log',
            out_file: '/home/ubuntu/logs/frontend-out.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
        },
    ],
};
