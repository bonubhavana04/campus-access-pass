const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')

const logPath = path.join(__dirname, '.server.log')
const logStream = fs.openSync(logPath, 'a')

const server = spawn(
  process.execPath,
  [path.join(__dirname, 'src', 'server.js')],
  {
    cwd: __dirname,
    detached: true,
    stdio: ['ignore', logStream, logStream],
  }
)

server.on('error', (err) => {
  console.error('Failed to start backend:', err.message)
  process.exit(1)
})

// Wait up to 10 s for the server to accept connections before detaching
const port = process.env.PORT || 5000
const deadline = Date.now() + 10_000

function waitReady() {
  http.get(`http://localhost:${port}/api/health`, (res) => {
    if (res.statusCode === 200) {
      server.unref()
      console.log(`Backend ready on port ${port}, PID: ${server.pid}`)
    } else {
      retry()
    }
    res.resume()
  }).on('error', retry)
}

function retry() {
  if (Date.now() > deadline) {
    console.error(`Backend did not become ready within 10 s. Check ${logPath}`)
    process.exit(1)
  }
  setTimeout(waitReady, 250)
}

retry()
