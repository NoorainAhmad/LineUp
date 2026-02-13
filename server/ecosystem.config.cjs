module.exports = {
  apps: [
    {
      name: 'lineup-server',
      script: 'dist/server.js', // Your main entry point
      instances: 1, // Use 'max' for all CPU cores
      exec_mode: 'fork', // 'cluster' for multiple instances
      watch: false, // Don't watch for changes (use in production)
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }, 
    }
  ]
};