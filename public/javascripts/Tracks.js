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

    offsetPos = 0; ///////constant to change when offset is changed by drag

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
                if (genes[chrom]["geneList"] === undefined) {        //////////if nothing in gene level then make it an asso array
                    genes[chrom]["geneList"] = [];
                }
                genes[chrom][gene]["gene_attributes"] = att;   /////////save into gene attributes at second level of track
                currgene = gene;
                genes[chrom][gene]["ID"] = gene;
                genes[chrom][gene]["start"] = start;
                genes[chrom][gene]["end"] = end;
                genes[chrom][gene]["score"] = score;            /////not sure if  ever use but keep it in anyway I guess?
                genes[chrom][gene]["strand"] = strand;          /////only defining in gene to save data since gene dir is mrna and exon dir
                //console.log(chrom, ' : ', genes[chrom][gene]["start"], ' : ', gene);
                //genes[chrom]["numGenes"]++;
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
        this.genes = genes;
    }

    drawTrack(chrom, boxWindow, trackPos, trackRange,windowOrigin,scale,chromLength) {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        //////for trackPos add or subtrack it * the trackwidth + padding from the windoworigin + boxwindow.x
        var trackDir;
        if (trackPos == 0) { trackDir = 0; } else { trackDir = trackPos < 0 ? 1 : -1; } ////////get the direction of padding
        var trackWidth = (boxWindow.width / 8);
        var trackLength = (boxWindow.height * 0.9);
        var relativeBoxy = windowOrigin.y + boxWindow.y; ////////so we dont have to add the windowOrigin each time
        var relativeBoxx = windowOrigin.x + boxWindow.x + (trackWidth * trackPos) + (trackWidth * 0.1 * trackDir);  //////////trackPos will change the relative x position to be centered on the track
        var startNumPosy = relativeBoxy - trackLength/2; //////////the top of base box
        var endNumPosy = relativeBoxy + trackLength/2;   /////////bottom of base box
        var startNumPosx = relativeBoxx + trackWidth * 0.1;  //////////draw numbers right outside of base box
        var startLinePosx = relativeBoxx - trackWidth * 0.1;
        var newLength = trackRange.end - trackRange.start;
        var chromHeight = (chromLength / newLength) * trackLength;
        
        ///////////////////////////////////////////////////////////////////////////////////
        ///////////////Draw the genes//////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////
        //if (chrom == "IV") { console.log(this.genes[chrom]["numGenes"]); }
        ctx.fillStyle = "#ff0000";
        var extTrackstarty = startNumPosy - trackLength * 0.15;
        var extTrackendy = startNumPosy + trackLength * 0.15;
        var t = 0;
        var padding = trackWidth * 0.03;
        var geneWidth = trackWidth * 0.08;
        for (var gene in this.genes[chrom]) {
            if (this.genes[chrom].hasOwnProperty(gene)) {
                var strand = this.genes[chrom][gene]["strand"];
                var geneRatio = ((this.genes[chrom][gene]["end"] - this.genes[chrom][gene]["start"]) / newLength);
                var geneStartRatio = ((this.genes[chrom][gene]["start"] - trackRange.start) / newLength);
                var geneHeight = trackLength * geneRatio;//geneEndy - geneStarty;
                var geneStarty = startNumPosy + trackLength * geneStartRatio;///// y start place
                var geneEndy = geneStarty + geneHeight;
                if (geneStarty < startNumPosy && geneEndy < startNumPosy || geneStarty > endNumPosy && geneEndy > endNumPosy) { } else {//////if out of bounds don't render 
                    if (geneStarty < startNumPosy) { geneStarty = startNumPosy; }
                    if (geneEndy > endNumPosy) { geneEndy = endNumPosy; }
                    geneHeight = geneEndy - geneStarty;
                    ctx.fillRect(startLinePosx - ((geneWidth + padding) * t), geneStarty, geneWidth , geneHeight);
                    
                }
                t++;
                t = t % 4; /////////staggers and jitters genes so hopefully no overlap //////will need to make adjustable if they have overlapping
            }
        }

        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 1;
        ctx.closePath();
    }
}