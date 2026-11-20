import "dotenv/config"
import express from 'express'
import connectDb from './config/db.js'
import agentRouter from './routes/agent.route.js'
import fileRouter from './routes/file.routes.js'
import storage from './storage/storage.js'

const port = process.env.PORT || 8003
const app = express()

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Routes
app.use("/files", fileRouter)
app.use("/", agentRouter)

app.get("/", (req, res) => {
    res.json({ message: "hello from Agent" })
})

app.listen(port, () => {
    console.log("Agent Started at", port)
    connectDb()

    // Run storage cleanup daily
    const retentionDays = parseInt(process.env.FILE_RETENTION_DAYS || "7", 10)
    storage.cleanup(retentionDays).catch(() => {})
    setInterval(() => {
        storage.cleanup(retentionDays).catch(() => {})
    }, 24 * 60 * 60 * 1000)
})
