/////////////////Genome Manager class and chromosome holder
class Genome {
    //////////////////constructor takes a new genome with chroms of x length
    constructor(numChrom) {
        this.numChrom = numChrom;
    }

    chromosomes = [];       ////////initialize empty array of chromosomes
    tracks = [];            ////////initialize empty array of track type class objects
    trackNames = [];
    trackMap = [];
    trackPos = {};
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

        var x, y, xi, yi, s = -1, height,width,divx, divy; 
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
            divx = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2);      ////////these are the x and y center of each division 
            divy = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2);

            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi);
            this.chromosomes.push(new Chromosome(this.chromNames[i], width, height, this.chromLengths[i], { x: x, y: y }, {x: divx, y: divy})); ////push to chromosome array
            
        }

    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initChrom() { ///////////Need to run this if only put numChrom into constructor
        var canvas = document.getElementById('myCanvas');
        var root = Math.ceil(Math.sqrt(this.numChrom));
        var defaultLength = (canvas.height * 0.8 * (1 / root));

        var xdiv = 1 / root;
        var ydiv = 1 / root;
        var width = defaultLength * 0.15;
        var tmpLength = 10000;
        var x, y, xi, yi, s = - 1,divx,divy;                   ///////s is set to 1 because modulo fires right after for loop starts
        for (var i = 0; i < this.numChrom; i++) {
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; }               ////////this works and is more elgent I guess
            yi = s % (1 / ydiv);

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((defaultLength * 0.15) / 2);
            y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (defaultLength / 2); 
            divx = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2);      ////////these are the x and y center of each division 
            divy = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2);

            //console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi); ///////position debugger
            this.chromosomes.push(new Chromosome(('chr' + i), width, defaultLength, tmpLength, { x: x, y: y }, { x: divx, y: divy })); ////push to chromosome array
        }
    }

    addGeneTrackFromGFF(f) {
        var file = readFile(f);
        var gff = gffToJSON(file.responseText);
        
        geneTrack = new geneTrack();
        geneTrack.trackFromGFF(gff);
        /////////////we will make a track map here but we need to make it editable from wihtin the application
        this.trackMap.push({
            chr1: "I", chr2: "II", chr3: "III", chr4: "IV",
            chr9: "IX", mito: "Mito", chr5: "V", chr6: "VI",
            chr7: "VII", chr8: "VIII", chr10: "X", chr11: "XI",
            chr12: "XII", chr13: "XIII", chr14: "XIV", chr15: "XV", chr16: "XVI"
        });
        for (var i = 0; i < this.numChrom; i++) { this.trackPos[this.chromNames[i]] = [0]; }    /////////for now gene track will be position 0 but will eventually have a variable system 
        this.tracks.push(geneTrack);
    }


    drawGenome(scale,windowOrigin) {
        var chromName, trackName,boxWindow,trackPos,trackRange;
        for (var i = 0; i < this.numChrom; i++) {
            chromName = this.chromNames[i];
            boxWindow = this.chromosomes[i].boxWindow;
            trackRange = this.chromosomes[i].trackRange;
            this.chromosomes[i].drawChromosome(scale, windowOrigin, this.defaultcentPos, this.trackPos[this.chromNames[i]]);
            for (var x = 0; x < this.tracks.length; x++) {
                trackPos = this.trackPos[chromName][x];
                trackName = this.trackMap[x][chromName];
                this.tracks[x].drawTrack(trackName, boxWindow, trackPos,trackRange,windowOrigin,scale,this.chromLengths[i]);
            }
        }
    }


}

class Chromosome {
    constructor(name,width,height,length,chromPos,boxPos) {
        this.name = name;
        this.length = length;
        this.xPos = chromPos.x;
        this.yPos = chromPos.y;
        this.height = height;   //////////For now we will set length to height from default length in genome initChrom
        this.width = width; //////15% of height seems like a good width
        this.boxWindow = { x: boxPos.x, y: boxPos.y, height: height, width: width * 8 }; ///leave it at 8 for now, seems that max before send off screen possibly make dynamic with zoom?
        this.oboxheight = height;
        this.chromRange = { start: 0, end: length };
        this.trackRange = { start: 0, end: length, offset: 0 };
    }

    

    highlight = false;
    scale = 1;
    dragging = false; ////for now not use but kinda annoying when you drag off chrom and it jumps
    dragDir = 0;

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

    update(movex,movey, zoom) {
        var canvas = document.getElementById("myCanvas");
        this.xPos += movex;
        this.yPos += movey;
        this.xPos *= zoom;
        this.yPos *= zoom;
        this.height *= zoom;
        this.width *= zoom;
        ///////////also do the same for the box
        this.boxWindow.x += movex;
        this.boxWindow.y += movey;
        this.boxWindow.x *= zoom;
        this.boxWindow.y *= zoom;
        this.boxWindow.height *= zoom; ////////this will make it so box/track size does not get smaller when over zoomed
        this.boxWindow.width *= zoom;
        /////////This if statement will not change box size to be bigger than canvas (for chroms of diff size)
        if (canvas.width > this.boxWindow.width * zoom) {
            if (this.boxWindow.height * zoom < this.height) {
                ////////////this works I don't know how but whatever
            } else {
                //this.boxWindow.height *= zoom;    /////////This will make it so the box/track gets smaller when over zoomed on chrom
                //this.boxWindow.width *= zoom;
            }
        } 
    }

    centerBox() {
        return { x: this.boxWindow.x, y: this.boxWindow.y };
    }

    highlightOn() {
        this.highlight = true;
    }

    highlightOff() {
        this.highlight = false;
    }

    zoomRange(zoom) {
        var tmp,newStart,newEnd;
        var trackLength = this.trackRange.end - this.trackRange.start;
        var newBumper = (trackLength - (trackLength / zoom)) / 2;
        if (trackLength == 100 & zoom > 1) {
            newStart = this.trackRange.start;
            newEnd = this.trackRange.end;
        } else {
            var newStart = Math.max(0, Math.floor(this.trackRange.start + newBumper));
            var newEnd = Math.max(newStart + 100, Math.min(this.length, Math.floor(this.trackRange.end - newBumper)));
        }
        var newLength = newEnd - newStart;
        if (newLength > this.chromRange.end - this.chromRange.start ) {} else {
            this.trackRange.start = newStart;
            this.trackRange.end = newEnd;
        }
    }

    dragRange(dragY) {
        var newLength = this.trackRange.end - this.trackRange.start;
        var sizeRatio = (Math.abs(dragY)/(this.boxWindow.height * 0.9));
        var speed = newLength * sizeRatio;////newLength / 10; /////the speed at which we pan  ///////we want it to go slower while less zoomed and faster while more
        //var dragDir;// = -(dragY > 0 ? 1 : -1); ///////make negative so that drag goes opposite way
        if (dragY < 0) { this.dragDir = 1; } else if (dragY > 0) { this.dragDir = -1; } ///else if (dragY == 0) { dragDir = 0; }
        ////////made dragdir a this object to avoid awkward 0's while dragging
        var newEnd = Math.floor(this.trackRange.end + speed * this.dragDir );///speed * dragDir); /////////- to make pan up drag down
        var newStart = Math.floor(this.trackRange.start + speed * this.dragDir);///speed * dragDir);
        
        //////////keep a space between the start and end
        this.trackRange.start = Math.min(this.chromRange.end - newLength,Math.max(0, newStart));      ///////////////////we cant stop from scrolling when we reach 0 or the end
        this.trackRange.end = Math.max(this.chromRange.start + newLength, Math.min(this.chromRange.end, newEnd));
        //console.log(dragY, ' ; ', speed, ' : ', dragDir, ' : ', newEnd, ' : ', newStart, ' : ', this.trackRange.start);
        ///////Now do the offset in increments of 0.2
        this.trackRange.offset = this.dragDir;//+= ;////move * speed;///(0.2 * dragDir);
        if (this.trackRange.offset < -1) { this.trackRange.offset = 0; }
        if (this.trackRange.offset > 1) { this.trackRange.offset = 0; }
        if (this.trackRange.start == 0 & this.dragDir == -1) { this.trackRange.offset = 0; }
        if (this.trackRange.end == this.chromRange.end & this.dragDir == 1) { this.trackRange.offset = 0; }
        
        ////console.log(this.trackRange.offset);
    }

    //////////////////////Draw function for ideogram
    drawChromosome(scale, windowOrigin, centPos,trackPos) {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        var relativePos = { x: this.xPos + windowOrigin.x, y: this.yPos + windowOrigin.y };

        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.font = "20px Arial";
        ctx.fillText(this.name, relativePos.x, relativePos.y); ////////write chromosome name above ideogram
        ctx.closePath();

        drawIdeogram(scale, relativePos, this.height, this.width, centPos, this.highlight);  ///////draw the ideogram
        ///////////////draw the outline of the boxWindow as a test
        var boxy = this.boxWindow.y - (this.boxWindow.height / 2) + windowOrigin.y;
        var boxx = this.boxWindow.x - (this.boxWindow.width / 2) + windowOrigin.x;

        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.strokeRect(boxx, boxy,this.boxWindow.width,this.boxWindow.height);
        ctx.closePath();

        /////////////we should draw the track windows now as well they will be of a certain size and will get more opaque with
        var tracky = this.boxWindow.y - ((this.boxWindow.height / 2)) + windowOrigin.y;
        var padding = 20;
        var trackWidth = this.boxWindow.width / 8; //////////For now we just put 8 b/c it fits over chrom well, but we will have to divide it more if more tracks than 8
        var trackHeight = this.boxWindow.height;
        var thickness = 2; /////define thickness of track window border
        ////////////maybe we should adapt it to more tracks than size of window allows
        ///////////need to add lines 
        for (var i = 0; i < trackPos.length; i++) {
            var trackx = windowOrigin.x + this.boxWindow.x - (trackWidth / 2) + ((trackWidth + padding) * trackPos[i]);
            ctx.beginPath();
            ctx.globalAlpha = Math.min(1, Math.max(0,1 - (1/scale)));       /////////makes more opaque as we scale

            ctx.fillStyle = '#000';
            ctx.fillRect(trackx - thickness, tracky - thickness, trackWidth + (thickness * 2), trackHeight + (thickness * 2)); ////draw track border window

            ctx.fillStyle = '#D6DBDF';//'#3333ff'; ///'#0000ff'; ///pure blue
            ctx.fillRect(trackx, tracky, trackWidth, trackHeight); //////fill track window
            
            ctx.globalAlpha = 1.0;
            ctx.closePath();
        }
        

    } 

}