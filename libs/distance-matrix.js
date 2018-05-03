const regprecise = require("./regprecise.js");

module.exports.construct = (genomeId, cb) => {
    regprecise.transcriptionalNetwork(genomeId, (err, network) => {
        if (err) cb(err);

        let matrix = "";

        for (let query of network) {
            for (let queryRegulator of query.regulators) {
                for (let target of network) {
                    //if (query == target) continue;
                    for (let targetRegulator of target.regulators) {
                        let commonGenes = 0;

                        for (let queryGene of query.genes) {
                            for (let targetGene of target.genes) {
                                if (queryGene.vimssId == targetGene.vimssId) {
                                    commonGenes++;
                                    continue;
                                }
                            }
                        }
                        
                        matrix += `${queryRegulator.vimssId}\t${targetRegulator.vimssId}\t${commonGenes}\n`;
                    }
                }
            }
        }

        cb(null, matrix);
    })
}