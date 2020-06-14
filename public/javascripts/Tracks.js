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

        function shortNum(num,resolution) {        ////////small function to abbr the number
            var tmp;
            
            if (num / 1000000 > 1 & resolution > 1000000) { tmp = (Math.floor(num / 100000) / 10) + ' Mb'; } else if (num / 1000 > 1 & resolution > 1000) { tmp = (Math.floor(num / 100) / 10) + ' Kb'; } else { tmp = num; }
            ///////////divide by 10 times less then divide by 10 again
            console.log(tmp);
            return tmp;
        };

        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, Math.max(0, 1 - (1 / scale)));
        ctx.fillStyle = '#000';
        ctx.lineWidth = 0.5;
        //////////////////////////////Add number annotations of position on chrom
        ctx.moveTo(startLinePosx, startNumPosy);
        ctx.lineTo(startNumPosx, startNumPosy);   /////////top line
        ctx.stroke();

        ctx.moveTo(startLinePosx, endNumPosy);
        ctx.lineTo(startNumPosx, endNumPosy);   /////////bottom line
        ctx.stroke();

        ctx.font = "10px Arial";
        ctx.fillText(shortNum(trackRange.start,newLength), startNumPosx, startNumPosy); ////////write start number at top of track
        
        ctx.fillText(shortNum(trackRange.end,newLength), startNumPosx, endNumPosy); ////////write end range number at bottom of track
        //////////////////////////////
        ;///var newLength = trackRange.end - trackRange.start;      /////for now we have it being 100 base boxes but it doesn't feel like it zooms all the way down mayber fix
        //var zoomedRatio = Math.min(100, Math.max(2, 100 - Math.floor((newLength / chromLength) * 100)));
        var baseDiv,baseRatio,baseStart,baseHeight;        ////////////////
        if (newLength > 100000) {
            baseRatio = newLength / (chromLength - 100000);
            baseDiv = Math.max(1,5 - (4 * baseRatio)); //////////5 to 1  ///////max should prevent funky stuff
        } else if (newLength > 10000 & newLength < 100000) {
            baseRatio = newLength / (100000 - 10000);
            baseDiv = 10 - (5 * baseRatio); /////////10 to 5
        } else if (newLength > 100 & newLength < 10000) {
            baseRatio = newLength / (10000 - 1000);
            baseDiv = 100 - (90 * baseRatio); /////100 to 10
        } else if (newLength == 100) {
            baseDiv = 100;
        } 

        var baseboxWidth = trackWidth * 0.02; //////basebox width is 0.05 of the trackwidth, maybe make it get bigger with zoom to fit more overlapping genes
        var divHeight = trackLength * (1 / baseDiv);
        var startBaseboxx = relativeBoxx - baseboxWidth / 2;
        var startBaseboxy = relativeBoxy - (trackLength / 2) - divHeight + (divHeight * -(trackRange.offset));////start -1 box up and add the box worth of  offset
        
        for (var i = 0; i < baseDiv + 2; i++) {     ////////+ 2 because we will be using a drag function that will require an extra div box on bottom and on top to make it appear as if it is moving
            baseStart = Math.max(startNumPosy,Math.min(endNumPosy, startBaseboxy + (divHeight * i)));    ////////limit start to start num Posy and end to endNumPosy
            if (baseStart + divHeight > endNumPosy) {   ///////////////////cases for when to stop or start panning track
                baseHeight = endNumPosy - baseStart;
            } else {
                if (startBaseboxy + (divHeight * i) < startNumPosy) {
                    if (startBaseboxy + (divHeight * i) + divHeight < startNumPosy) {
                        baseHeight = 0;
                    } else { baseHeight = (startBaseboxy + (divHeight * (i + 1))) - startNumPosy ; }
                } else { baseHeight = divHeight; }
            }
            ctx.strokeRect(startBaseboxx, baseStart, baseboxWidth, baseHeight);
            
        }
        /////////////draw the positions of 5 ticks to better gauge lengths on tracks
        var tickLength = trackLength / 6;
        for (var i = 0; i < 7; i++) {
            var tickPosy = startNumPosy + (tickLength * i) - (tickLength * trackRange.offset);
            var tickNum = Math.floor(trackRange.start + (newLength / 5) * i);
            if (i % 2 == 0) {
                var tickStart = relativeBoxx - trackWidth * 0.075;
                var tickEnd = relativeBoxx + trackWidth * 0.075;
            } else {
                var tickStart = relativeBoxx - trackWidth * 0.05;
                var tickEnd = relativeBoxx + trackWidth * 0.05;
            }
            if (tickPosy <= startNumPosy || tickPosy >= endNumPosy) { } else {
                ctx.fillText(shortNum(tickNum, newLength), startNumPosx, tickPosy);
                ctx.moveTo(tickStart, tickPosy);
                ctx.lineTo(tickEnd, tickPosy);
                ctx.stroke();
            }
        }
        ////if (chrom == "IV") { console.log(baseStart + divHeight, ' : ', endNumPosy); }

        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 1;
        ctx.closePath();
    }
}