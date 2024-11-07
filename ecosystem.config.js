module.exports = {
    apps: [{
      name: "jetton-api",
      script: "./src/api/server.ts",
      interpreter: "node",
      interpreter_args: "-r ts-node/register",
      watch: true,
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 80
      }
    }]
  }