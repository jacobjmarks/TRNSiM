const path = require("path");
const express = require("express");
const app = express();

const regprecise = require("./libs/regprecise.js");
const similarityMatrix = require("./libs/similarity-matrix.js");

const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    regprecise.getGenomes((err, genomes) => {
        if (err) return res.status(500).end(err);
        res.render("genomes.pug", { genomes: genomes });
    })
});

app.get("/:genomeId", (req, res) => {
    similarityMatrix.construct(req.params.genomeId, (err, matrix) => {
        res.contentType("text/plain").send(matrix).end();
    })
});

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});