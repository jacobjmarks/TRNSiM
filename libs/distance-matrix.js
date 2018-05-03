const regprecise = require("./regprecise.js");

module.exports.construct = (genomeId, cb) => {
    regprecise.transcriptionalNetwork(genomeId, (err, network) => {
        if (err) cb(err);

        let matrix = "";

        // Column headers
        for (let net of network) {
            for (let regulator of net.regulators) {
                matrix += `\t${regulator.vimssId}`;
            }
        }

        matrix += '\n';

        for (let query of network) {
            for (let queryRegulator of query.regulators) {
                matrix += queryRegulator.vimssId;
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
                        
                        matrix += `\t${commonGenes}`;
                    }
                }
                matrix += '\n';
            }
        }

        cb(null, matrix);
    })
}