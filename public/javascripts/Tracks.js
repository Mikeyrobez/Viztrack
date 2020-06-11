class Track {
    constructor() { };
}

class geneTrack extends Track {
    constructor() {
        super();
    };

    ////////genes will be a associative array with the following kind of structure
    //////track setup
        /// chrom
        ///   -> gene + attributes + position
        ///        -> mRNA + attributes + position
        ///            -> exon + position + attributes

    trackFromGFF(gff) {
        var genes = {};
        function doSplit(array) {
            var atts = {}, att1, att2;
            for (var x = 0; x < array.length; x++) {
                att1 = array[x].split('=')[0];
                att2 = array[x].split('=')[1];
                atts[att1] = att2;
            }
            return atts;
        }

        var att, type, start, end, score, strand, phase, gene, chrom, mRNA, exon, currmRNA, currgene, chromNames = [];

        for (var i = 0; i < gff.length; i++) {        /////////Real one use below for testing purposes 
        //for (var i = 0; i < 10; i++) {
            att = doSplit(gff[i]["attributes"].split(';'));  ////////can first split using ';' and then split again with '=' making the [0] the header name and [1] the value
            chrom = gff[i]["seqid"];
            if (genes[chrom] === undefined) {        //////////if nothing in chrom level then make it an asso array
                genes[chrom] = {};
                chromNames.push(chrom);    //////////add the name of the chromosome to 'chromNames' only does this the first time
            }
            type = gff[i]["type"];
            ////'seqid', 'source', 'type', 'start', 'end', 'score', 'strand', 'phase', 'attributes']
            start = gff[i]["start"];
            end = gff[i]["end"];
            score = gff[i]["score"];
            strand = gff[i]["strand"];
            phase = gff[i]["phase"];

            if (type == "gene") {
                gene = att['ID'];    ////////get gene name to access first level of track
                if (genes[chrom][gene] === undefined) {        //////////if nothing in gene level then make it an asso array
                    genes[chrom][gene] = {};
                }
                genes[chrom][gene]["gene_attributes"] = att;   /////////save into gene attributes at second level of track
                currgene = gene;
                genes[chrom][gene]["start"] = start;
                genes[chrom][gene]["end"] = end;
                genes[chrom][gene]["score"] = score;            /////not sure if  ever use but keep it in anyway I guess?
                genes[chrom][gene]["strand"] = strand;          /////only defining in gene to save data since gene dir is mrna and exon dir

            }

            if (type == "mRNA") {
                gene = att['Parent'];
                mRNA = att['ID'];
                if (genes[chrom][gene] === undefined) {        //////////if nothing in top level then make it an asso array incase, gene is not first entry
                    genes[chrom][gene] = {};
                }
                if (genes[chrom][gene][mRNA] === undefined) {
                    genes[chrom][gene][mRNA] = {};
                }
                
                genes[chrom][gene][mRNA]['mRNA_attributes'] = att;
                currmRNA = mRNA;
                genes[chrom][gene][mRNA]["start"] = start;
                genes[chrom][gene][mRNA]["end"] = end;
                genes[chrom][gene][mRNA]["score"] = score;
            }

            if (type == "exon") {
                gene = currgene;                ////////should add a error handler to tell that something is wrong with gff if not the same parent to currmRNA
                mRNA = att['Parent'];
                exon = att['exon_id'];
                if (genes[chrom][gene] === undefined) {        //////////if nothing in top level then make it an asso array incase, gene is not first entry
                    genes[chrom][gene] = {};
                }
                if (genes[chrom][gene][mRNA] === undefined) {
                    genes[chrom][gene][mRNA] = {};
                }
                if (genes[chrom][gene][mRNA][exon] === undefined) {
                    genes[chrom][gene][mRNA][exon] = {};
                }
                if (genes[chrom][gene][mRNA]['exons'] === undefined) {        ////////must define an exon array to store the names of all the exons for any loops that draw each exon
                    genes[chrom][gene][mRNA]['exons'] = [];
                }
                genes[chrom][gene][mRNA][exon]['exon_attributes'] = att;
                genes[chrom][gene][mRNA]['exons'].push(exon);
                genes[chrom][gene][mRNA]["start"] = start;
                genes[chrom][gene][mRNA]["end"] = end;
                genes[chrom][gene][mRNA]["score"] = score;

            }

            if (type == "CDS") { ////////////define at a later date, doesn't even matter since no sequence to go off of
                //genes[chrom][gene]["phase"] = phase;      //////phase is only really ever used in CDS
            }
        }
        genes['chromNames'] = chromNames;
        console.log(genes['chromNames']);
        this.genes = genes;
    }

    drawTrack() {
        /////////This will draw the individual genes
    }
}