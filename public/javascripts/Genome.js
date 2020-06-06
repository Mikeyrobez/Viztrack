/////////////////Genome Manager class and chromosome holder
class Genome {
    //////////////////constructor takes a new genome with chroms of x length
    constructor(numChrom) {
        this.numChrom = numChrom;
    }

    chromosomes = [];       ////////initialize empty array of chromosomes
    centPos = 0.45;
    initChrom() {
        var canvas = document.getElementById('myCanvas');
        var padding = 100;                                  /////////Pad so that there is 50 px on either side of each chrom
        var dist = (canvas.width - padding) / this.numChrom;     /////////dist between each chrom
        var insertPos = (padding / 2) - (canvas.width / 2);
        var defaultLength = 0;                              /////////will change later when start adding chroms of diff length (maybe relative?)
        for (var i = 0; i < this.numChrom; i++) {
            this.chromosomes.push(new Chromosome(defaultLength, { x: insertPos, y: 0 })); ////push to chromosome array
            insertPos += dist;
        }
    };

    drawGenome(scale,windowOrigin) {
        for (var i = 0; i < this.numChrom; i++) {
            this.chromosomes[i].drawChromosome(scale, windowOrigin,this.centPos);
        }
    }
}

class Chromosome {
    constructor(length, chromPos) {
        this.length = length;
        this.xPos = chromPos.x;
        this.yPos = chromPos.y;
    }


    height = 250;   /////////hieght, will make this adaptable to the relative length of the chromosome
    width = 35;
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