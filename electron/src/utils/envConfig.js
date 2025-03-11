const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

function loadEnvConfig() {
  const envPath = path.join(__dirname, '../../../.env')
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath))
    for (const k in envConfig) {
      process.env[k] = envConfig[k]
    }
    console.log('Environment variables loaded')
  } else {
    console.warn('.env file not found')
  }
}

module.exports = {
  loadEnvConfig
} 