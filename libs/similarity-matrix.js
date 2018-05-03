const regprecise = require("./regprecise.js");

module.exports.construct = (genomeId, cb) => {
    regprecise.transcriptionalNetwork(genomeId, (err, network) => {
        if (err) cb(err);

        let matrix = "";
        let normalise = true;

        // Set csv column headers and remove duplicate genes
        for (let net of network) {
            for (let regulator of net.regulators) {
                matrix += `,${regulator.vimssId}`;
            }

            net.genes = net.genes.reduce(
                (a, b) => {
                    if (!a.find((g) => g.vimssId == b.vimssId)) a.push(b);
                    return a;
                }, []
            );
        }

        matrix += '\n';

        for (let query of network) {
            for (let queryRegulator of query.regulators) {
                matrix += queryRegulator.vimssId;
                for (let target of network) {
                    for (let targetRegulator of target.regulators) {
                        let commonGenes = 0;

                        for (let queryGene of query.genes) {
                            for (let targetGene of target.genes) {
                                if (queryGene.vimssId == targetGene.vimssId) {
                                    commonGenes++;
                                    break;
                                }
                            }
                        }
                        
                        matrix += `,${normalise ? commonGenes / query.genes.length : commonGenes}`;
                    }
                }
                matrix += '\n';
            }
        }

        cb(null, matrix);
    })
}