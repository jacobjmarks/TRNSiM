const request = require("request");

module.exports.getGenomes = (cb) => {
    request({
        method: "GET",
        url: `http://regprecise.lbl.gov/Services/rest/genomeStats`,
    }, (error, response, body) => {
        if (response.statusCode != 200) return cb("Error retrieving genomes.");
        let genomes = JSON.parse(body)["genomeStat"];
        return cb(null, genomes.length ? genomes : [genomes]);
    })
}

module.exports.getRegulons = (genomeId, cb) => {
    request({
        method: "GET",
        url: `http://regprecise.lbl.gov/Services/rest/regulons?genomeId=${genomeId}`
    }, (error, response, body) => {
        if (response.statusCode != 200) return cb("Error retrieving regulons.");
        let regulons = JSON.parse(body)["regulon"];
        return cb(null, regulons.length ? regulons : [regulons]);
    })
}

module.exports.getGenes = (regulonId, cb) => {
    request({
        method: "GET",
        url: `http://regprecise.lbl.gov/Services/rest/genes?regulonId=${regulonId}`,
    }, (error, response, body) => {
        if (response.statusCode != 200) return cb("Error retrieving genes.");
        let genes = JSON.parse(body)["gene"];
        return cb(null, genes.length ? genes : [genes]);
    })
}

module.exports.getRegulators = (regulonId, cb) => {
    request({
        method: "GET",
        url: `http://regprecise.lbl.gov/Services/rest/regulators?regulonId=${regulonId}`,
    }, (error, response, body) => {
        if (response.statusCode != 200) return cb("Error retrieving regulator.");
        body = JSON.parse(body);
        let regulators = body && body["regulator"];
        if (!regulators) return cb(null, null);
        return cb(null, regulators.length ? regulators : [regulators]);
    })
}

module.exports.transcriptionalNetwork = (genomeId, cb) => {
    this.getRegulons(genomeId, (err, regulons) => {
        if (err) return cb(err, null);

        let network = [];

        let regulonCount = regulons.length;
        let reqError = false;

        for (let regulon of regulons) {
            this.getRegulators(regulon.regulonId, (err, regulators) => {
                if (!regulators) return regulonCount--;
                if (reqError) return;

                if (err) {
                    reqError = true;
                    regulonCount--;
                    return cb(err, null);
                }

                this.getGenes(regulon.regulonId, (err, genes) => {
                    if (reqError) return;
    
                    if (err) {
                        reqError = true;
                        regulonCount--;
                        return cb(err, null);
                    }

                    let filteredGenes = [];

                    for (let gene of genes) {
                        let match = false;
                        for (let regulator of regulators) {
                            if (gene.vimssId == regulator.vimssId) {
                                match = true;
                            }
                        }

                        if (!match) filteredGenes.push(gene);
                    }

                    network.push({
                        regulators: regulators,
                        genes: filteredGenes
                    });

                    if (network.length == regulonCount) {
                        cb(null, network);
                    }
                })
            })
        }
    })
}