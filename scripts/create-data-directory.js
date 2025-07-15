const fs = require("fs")
const path = require("path")

const dataDir = path.join(process.cwd(), "data")

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log("Created data directory for SQLite database")
} else {
  console.log("Data directory already exists")
}
