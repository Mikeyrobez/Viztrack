/////////////////Genome Manager class and chromosome holder
class Genome {
    //////////////////constructor takes a new genome with chroms of x length
    constructor(numChrom) {
        this.numChrom = numChrom;
    }

    chromosomes = [];       ////////initialize empty array of chromosomes
    defaultcentPos = 0.35;         ////////relative percentage of the p arm to the q arm of the chromosome
    absHeight = 400;

    //////////////////Perhaps I will make it so that the width doesn't change with the different length chrom because it looks a little wierd and too skinny
    ////////////////////////////Initializes a genome from a bed file that specificies the size of each chrom
    genomeFromBed(f) {
        var canvas = document.getElementById('myCanvas');
        var file = readFile(f);
        var bed = bedToJSON(file.responseText); ///////Imports the genome Bed file into a json 2d array
        this.chromNames = select(bed, 'chrom',);
        this.numChrom = bed.length;
        var lengths = select(bed, 'chromEnd','num'); ///select auto convert to string but num will change it to a number
        var maxLength = Math.max.apply(Math, lengths);
        var defaultLength = 400 * (1 - (0.05 * this.numChrom));         ///////////height of ideo based on number of chroms
        
        /////////////////////////// set up number of ideos per row
        var xdiv = 1;
        var ydiv = 1;
        if (this.numChrom > 1 & this.numChrom < 5) { xdiv = 0.5; } else if (this.numChrom >= 5) { xdiv = 1 / Math.ceil(this.numChrom / 2); }
        if (this.numChrom > 2 & this.numChrom < 13) { ydiv = 0.5; } else if (this.numChrom >= 13) { ydiv = 1 / Math.ceil(this.numChrom / 6); }               /////////for right now there are only two rows on y
        console.log(ydiv);
        var x, y, xi, yi, s = (1 / ydiv) - 1, height; 
        //////////////////////////iterate through and create each chromosome object
        for (var i = 0; i < this.numChrom; i++) {
            if (xi == 0) { s++; }               ////////this works and is more elgent I guess
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            yi = s % (1 / ydiv);

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            height = (lengths[i] / maxLength) * defaultLength;
            x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((defaultLength * 0.15) / 2);
            y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (defaultLength / 2);
            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi); ///////position debugger
            this.chromosomes.push(new Chromosome(height, { x: x, y: y })); ////push to chromosome array
        }

    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initChrom() { ///////////Need to run this if only put numChrom into constructor
        var canvas = document.getElementById('myCanvas');
        
        var defaultLength = 400 * (1 - (0.05 * this.numChrom));        //////For now it just decreases a set size based on numchrom, but will have to make it exponential decrease b/c dont want to go under 0         
        var xdiv = 1;
        var ydiv = 1;
        if (this.numChrom > 1 & this.numChrom < 5) { xdiv = 0.5; } else if (this.numChrom >= 5) { xdiv = 1 / Math.ceil(this.numChrom/2); }
        if (this.numChrom > 2) { ydiv = 0.5; } else if (this.numChrom >= 12) { ydiv = 1 / Match.ciel(this.numChrom/6); }               /////////for right now there are only two rows on y
        var x, y, xi, yi, s = (1/ydiv) - 1;                   ///////s is set to 1 because modulo fires right after for loop starts
        for (var i = 0; i < this.numChrom; i++) {
            if (xi == 0) { s++; }               ////////this works and is more elgent I guess
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            yi = s % (1 / ydiv);

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((defaultLength * 0.15) / 2);
            y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (defaultLength / 2); 
            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi); ///////position debugger
            this.chromosomes.push(new Chromosome(defaultLength, { x: x , y: y })); ////push to chromosome array
        }
    }

    drawGenome(scale,windowOrigin) {
        for (var i = 0; i < this.numChrom; i++) {
            this.chromosomes[i].drawChromosome(scale, windowOrigin,this.defaultcentPos);
        }
    }
}

class Chromosome {
    constructor(length, chromPos) {
        this.length = length;
        this.xPos = chromPos.x;
        this.yPos = chromPos.y;
        this.height = length;   //////////For now we will set length to height from default length in genome initChrom
        this.width = length * 0.11; //////15% of height seems like a good width
    }


    //height = 250;   /////////hieght, will make this adaptable to the relative length of the chromosome
    //width = height * 0.15;//35;
    highlight = false;

    ///////////////////////Check function to see if over bounding box
    check(mousex,mousey,windowOrigin) {
        var minx = windowOrigin.x + this.xPos,
            maxx = windowOrigin.x + this.xPos + this.width,
            miny = windowOrigin.y + this.yPos,
            maxy = windowOrigin.y + this.yPos + this.height;
        //console.log('X vals: ', minx, '---->', mousex, '<----', maxx); //////Position debugger
        //console.log('Y vals: ', miny, '---->', mousey, '<----', maxy);
        if (mousex > minx & mousex < maxx & mousey > miny & mousey < maxy) { return true; }
    }

    update(movex,movey,zoom) {
        this.xPos += movex;
        this.yPos += movey;
        this.xPos *= zoom;
        this.yPos *= zoom;
        this.height *= zoom;
        this.width *= zoom;
    }

    highlightOn() {
        this.highlight = true;
    }

    highlightOff() {
        this.highlight = false;
    }

    //////////////////////Draw function for ideogram
    drawChromosome(scale, windowOrigin, centPos) {
        var relativePos = { x: this.xPos + windowOrigin.x, y: this.yPos + windowOrigin.y };
        drawIdeogram(scale, relativePos, this.height, this.width, centPos, this.highlight);
    } 

}