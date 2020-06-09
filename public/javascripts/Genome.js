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
        this.chromNames = select(bed, 'chrom');
        this.numChrom = bed.length;
        this.chromLengths = select(bed, 'chromEnd','num'); ///select auto convert to string but num will change it to a number

        var root = Math.ceil(Math.sqrt(this.numChrom));         /////////square root for number of chroms will be used for ideo row and col number
        var maxLength = Math.max.apply(Math, this.chromLengths);
        var defaultLength = (canvas.height * 0.8 * (1 / root));// * asymp;         ///////////height of ideo based on number of chroms
        ////////the maxheight wille be .75 of canvas size divided by number of rows
        /////////////////////////// set up number of ideos per row
                
        var xdiv = 1 / root;
        var ydiv = 1 / root;
        
        ////////////////Instead we will make things symmetrical using the ceiling of square root of numChrom

        var x, y, xi, yi, s = -1, height,width; 
        //////////////////////////iterate through and create each chromosome object
        for (var i = 0; i < this.numChrom; i++) {
                        
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; } 
            yi = s;//s % (1 / ydiv);

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            height = (this.chromLengths[i] / maxLength) * defaultLength;
            width = height * 0.15;
            x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((height * 0.15) / 2);
            y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (height / 2);
            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi);
            this.chromosomes.push(new Chromosome(this.chromNames[i], width, height, this.chromLengths[i], { x: x, y: y })); ////push to chromosome array
        }

    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initChrom() { ///////////Need to run this if only put numChrom into constructor
        var canvas = document.getElementById('myCanvas');
        var root = Math.ceil(Math.sqrt(this.numChrom));
        var defaultLength = (canvas.height * 0.8 * (1 / root));
        //var xdiv = 1;
        //var ydiv = 1;

        var xdiv = 1 / root;
        var ydiv = 1 / root;
        var width = defaultLength * 0.15;
        var tmpLength = 10000;
        //if (this.numChrom > 1 & this.numChrom < 5) { xdiv = 0.5; } else if (this.numChrom >= 5) { xdiv = 1 / Math.ceil(this.numChrom/2); }
        //if (this.numChrom > 2) { ydiv = 0.5; } else if (this.numChrom >= 12) { ydiv = 1 / Match.ciel(this.numChrom/6); }               /////////for right now there are only two rows on y
        var x, y, xi, yi, s = - 1,name;                   ///////s is set to 1 because modulo fires right after for loop starts
        for (var i = 0; i < this.numChrom; i++) {
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; }               ////////this works and is more elgent I guess
            yi = s % (1 / ydiv);

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((defaultLength * 0.15) / 2);
            y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (defaultLength / 2); 
            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi); ///////position debugger
            this.chromosomes.push(new Chromosome(('chr' + i), width, defaultLength, tmpLength, { x: x, y: y })); ////push to chromosome array
        }
    }

    drawGenome(scale,windowOrigin) {
        for (var i = 0; i < this.numChrom; i++) {
            this.chromosomes[i].drawChromosome(scale, windowOrigin,this.defaultcentPos);
        }
    }
}

class Chromosome {
    constructor(name,width,height,length,chromPos) {
        this.name = name;
        this.length = length;
        this.xPos = chromPos.x;
        this.yPos = chromPos.y;
        this.height = height;   //////////For now we will set length to height from default length in genome initChrom
        this.width = width; //////15% of height seems like a good width
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
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var relativePos = { x: this.xPos + windowOrigin.x, y: this.yPos + windowOrigin.y };

        ctx.font = "20px Arial";
        ctx.fillText(this.name, relativePos.x, relativePos.y); ////////write chromosome name above ideogram
        drawIdeogram(scale, relativePos, this.height, this.width, centPos, this.highlight);  ///////draw the ideogram
    } 

}