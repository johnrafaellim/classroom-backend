import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Welcome to the backend!");
})

app.listen(PORT, () => console.log(`App listening on port http://localhost:${PORT}`));