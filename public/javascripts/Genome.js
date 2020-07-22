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

    genomeFromFasta(f,genomeWindow) {
        var canvas = document.getElementById('myCanvas');
        var file = readFile(f);
        this.sequence = {};
        ///console.log(file.responseText.slice(0,10));
        ////It appears that slice() can return a certain number of bytes but I think that readFile already loads the entire FASTA into memory
        ////Will just read the entire FASTA for now but when dealing with bigger FASTA I want to be able to load a small amount at a time.
        var genomeString = file.responseText;
        var genomeSplit = genomeString.split('>');
        genomeSplit.shift();
        this.chromNames = [];
        this.mapNames = {};
        this.chromLengths = [];
        this.numChrom = genomeSplit.length;
        
        for (var i = 0; i < genomeSplit.length;i++) {
            var name = genomeSplit[i].split("\n")[0];
            var shortname = genomeSplit[i].split("\n")[0].split(" ")[0];
            this.chromNames.push(shortname);
            this.mapNames[shortname] = {};
            this.mapNames[shortname]["sequenceName"] = name;
            this.chromLengths.push(genomeSplit[i].split("\n").slice(1).join("").length);
            this.sequence[name] = genomeSplit[i].split("\n").slice(1).join("");
        }
        //console.log(this.mapNames);

        var root = Math.ceil(Math.sqrt(this.numChrom));         /////////square root for number of chroms will be used for ideo row and col number
        var maxLength = Math.max.apply(Math, this.chromLengths);
        var defaultLength = (genomeWindow.height * 0.8 * (1 / root));// * asymp;         ///////////height of ideo based on number of chroms
        ////////the maxheight wille be .75 of canvas size divided by number of rows
        /////////////////////////// set up number of ideos per row
        
        var xdiv = 1 / root;
        var ydiv = 1 / root;

        var x, y, xi, yi, s = -1, height, width, divx, divy;
        //////////////////////////iterate through and create each chromosome object
        for (var i = 0; i < this.numChrom; i++) {
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; }
            yi = s;

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            height = (this.chromLengths[i] / maxLength) * defaultLength;
            width = height * 0.15;
            divx = genomeWindow.x + (-(genomeWindow.width / 2)) + (genomeWindow.width * xdiv * (xi + 1)) - ((genomeWindow.width * xdiv) / 2);      ////////these are the x and y center of each division 
            divy = genomeWindow.y + (-(genomeWindow.height / 2)) + (genomeWindow.height * ydiv * (yi + 1)) - ((genomeWindow.height * ydiv) / 2);
            x = divx - ((height * 0.15) / 2);
            y = divy - (height / 2);

            this.chromosomes.push(new Chromosome(this.chromNames[i], width, height, this.chromLengths[i], { x: x, y: y }, { x: divx, y: divy })); ////push to chromosome array
            
        }
    }

    update(genomeWindow) {
        this.chromosomes = [];
        var root = Math.ceil(Math.sqrt(this.numChrom));         /////////square root for number of chroms will be used for ideo row and col number
        var maxLength = Math.max.apply(Math, this.chromLengths);
        var defaultLength = (genomeWindow.height * 0.8 * (1 / root));// * asymp;         ///////////height of ideo based on number of chroms
        ////////the maxheight wille be .75 of canvas size divided by number of rows
        /////////////////////////// set up number of ideos per row

        var xdiv = 1 / root;
        var ydiv = 1 / root;

        var x, y, xi, yi, s = -1, height, width, divx, divy;
        //////////////////////////iterate through and create each chromosome object
        for (var i = 0; i < this.numChrom; i++) {
            xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; }
            yi = s;

            ///////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
            height = (this.chromLengths[i] / maxLength) * defaultLength;
            width = height * 0.15;
            divx = genomeWindow.x + (-(genomeWindow.width / 2)) + (genomeWindow.width * xdiv * (xi + 1)) - ((genomeWindow.width * xdiv) / 2);      ////////these are the x and y center of each division 
            divy = genomeWindow.y + (-(genomeWindow.height / 2)) + (genomeWindow.height * ydiv * (yi + 1)) - ((genomeWindow.height * ydiv) / 2);
            x = divx - ((height * 0.15) / 2);
            y = divy - (height / 2);
            this.chromosomes.push(new Chromosome(this.chromNames[i], width, height, this.chromLengths[i], { x: x, y: y }, { x: divx, y: divy })); ////push to chromosome array

        }
    }

    /////////probably unneeded method (build x number of chrom from constructor)
    //initChrom() { ///////////Need to run this if only put numChrom into constructor 
    //    var canvas = document.getElementById('myCanvas');
    //    var root = Math.ceil(Math.sqrt(this.numChrom));
    //    var defaultLength = (canvas.height * 0.8 * (1 / root));

    //    var xdiv = 1 / root;
    //    var ydiv = 1 / root;
    //    var width = defaultLength * 0.15;
    //    var tmpLength = 10000;
    //    var x, y, xi, yi, s = - 1,divx,divy;                   ///////s is set to 1 because modulo fires right after for loop starts
    //    for (var i = 0; i < this.numChrom; i++) {
    //        xi = i % (1 / xdiv);                ////////We need to set everytime moves to end of row back to 0
    //        if (xi == 0) { s++; }               ////////this works and is more elgent I guess
    //        yi = s % (1 / ydiv);

    //        /////////sets left to -400//////Adds the number of divs/////////////subtract have the div/////////subtract chrom width
    //        x = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2) - ((defaultLength * 0.15) / 2);
    //        y = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2) - (defaultLength / 2); 
    //        divx = (-(canvas.width / 2)) + (canvas.width * xdiv * (xi + 1)) - ((canvas.width * xdiv) / 2);      ////////these are the x and y center of each division 
    //        divy = (-(canvas.height / 2)) + (canvas.height * ydiv * (yi + 1)) - ((canvas.height * ydiv) / 2);

    //        console.log(i, ' : ', s, ' : ', x, ' : ', y, ' : ', xdiv, ' : ', ydiv, ' : ', xi, ' : ',  yi); ///////position debugger
    //        this.chromosomes.push(new Chromosome(('chr' + i), width, defaultLength, tmpLength, { x: x, y: y }, { x: divx, y: divy })); ////push to chromosome array
    //    }
    //}

    addGeneTrackFromGFF(f) {
        var file = readFile(f);
        var gff = gffToJSON(file.responseText);
        
        geneTrack = new geneTrack();
        geneTrack.trackFromGFF(gff);
        /////////////we will make a track map here but we need to make it editable from wihtin the application
        //this.trackMap.push({
        //    chr1: "I", chr2: "II", chr3: "III", chr4: "IV",
        //    chr9: "IX", mito: "Mito", chr5: "V", chr6: "VI",
        //    chr7: "VII", chr8: "VIII", chr10: "X", chr11: "XI",
        //    chr12: "XII", chr13: "XIII", chr14: "XIV", chr15: "XV", chr16: "XVI"
        //});
        this.trackMap.push({ /////////need to make this adjustable at upload or make it figure it out by itself
            I: "I", II: "II", III: "III", IV: "IV",
            IX: "IX", Mito: "Mito", V: "V", VI: "VI",
            VII: "VII", VIII: "VIII", X: "X", XI: "XI",
            XII: "XII", XIII: "XIII", XIV: "XIV", XV: "XV", XVI: "XVI"
        });
        //for (var i = 0; i < this.numChrom; i++) { this.trackPos[this.chromNames[i]] = [0]; }    /////////for now gene track will be position 0 but will eventually have a variable system 
        ////probably getting rid of trackPos and making it dynamic depending on tracknumber
        this.tracks.push(geneTrack);
    }

    drawGenomeTrack(boxWindow, trackRange, windowOrigin, scale, chromLength) {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        //////for trackPos add or subtrack it * the trackwidth + padding from the windoworigin + boxwindow.x
        var trackDir = 0;////unnecessary for genome track but whatevs
        //if (trackPos == 0) { trackDir = 0; } else { trackDir = trackPos < 0 ? 1 : -1; } ////////get the direction of padding
        var trackWidth = (boxWindow.width / 8); 
        var trackLength = (boxWindow.height * 0.9);
        var relativeBoxy = windowOrigin.y + boxWindow.y; ////////so we dont have to add the windowOrigin each time
        var relativeBoxx = windowOrigin.x + boxWindow.x + (trackWidth * 0) + (trackWidth * 0.1 * trackDir);  //////////trackPos will change the relative x position to be centered on the track
        var startNumPosy = relativeBoxy - trackLength / 2; //////////the top of base box
        var endNumPosy = relativeBoxy + trackLength / 2;   /////////bottom of base box
        var startNumPosx = relativeBoxx + trackWidth * 0.1;  /////////draw numbers right outside of base box
        var startLinePosx = relativeBoxx - trackWidth * 0.1;
        var newLength = trackRange.end - trackRange.start;
        var chromHeight = (chromLength / newLength) * trackLength;
        function shortNum(num, resolution) {        ////////small function to abbr the number
            var tmp;
            if (num / 1000000 > 1 & resolution > 1000000) { tmp = (Math.floor(num / 100000) / 10) + ' Mb'; } else if (num / 1000 > 1 & resolution > 1000) { tmp = (Math.floor(num / 100) / 10) + ' Kb'; } else { tmp = num; }
            ///////////divide by 10 times less then divide by 10 again
            return tmp;
        };
        ///////////////////////////////////////////
        //////Add lines and top and bottom ticks////
        /////////////////////////////////////////////
        ctx.beginPath();
        ctx.globalAlpha = Math.min(1, Math.max(0, 1 - (1 / scale)));
        ctx.fillStyle = '#000';
        ctx.lineWidth = 0.5;
        //////////////////////////////Add number annotations of position on chrom
        ctx.moveTo(startLinePosx, startNumPosy);
        ctx.lineTo(startNumPosx, startNumPosy);   /////////top line
        ctx.stroke();
        /////////////////
        ctx.moveTo(startLinePosx, endNumPosy);
        ctx.lineTo(startNumPosx, endNumPosy);   /////////bottom line
        ctx.stroke();
        /////////////////
        ctx.font = "10px Arial";
        ctx.fillText(shortNum(trackRange.start, newLength), startNumPosx, startNumPosy); ////////write start number at top of track
        ctx.fillText(shortNum(trackRange.end, newLength), startNumPosx, endNumPosy); ////////write end range number at bottom of track
        //////////////////////////////
        var baseDiv, baseRatio, baseStart, baseHeight;        ////////////////
        if (newLength > 100000) {
            baseRatio = newLength / (chromLength - 100000);
            baseDiv = Math.max(1, 5 - (4 * baseRatio)); //////////5 to 1  ///////max should prevent funky stuff
        } else if (newLength > 10000 & newLength < 100000) {
            baseRatio = newLength / (100000 - 10000);
            baseDiv = 10 - (5 * baseRatio); /////////10 to 5
        } else if (newLength > 100 & newLength < 10000) {
            baseRatio = newLength / (10000 - 1000);
            baseDiv = 100 - (90 * baseRatio); /////100 to 10
        } else if (newLength == 100) {
            baseDiv = 100;
        }
        /////////////////////////////////////////////////////////////////////////
        ////////////////Draw the boxes that the bases will go in ////////////////
        /////////////////////////////////////////////////////////////////////////
        var baseboxWidth = trackWidth * 0.04; //////basebox width is 0.05 of the trackwidth, maybe make it get bigger with zoom to fit more overlapping genes
        var startBaseboxx = relativeBoxx - baseboxWidth / 2;
        var divLength = newLength / baseDiv;
        var divHeight = trackLength / baseDiv;
        var firstBase = Math.floor(trackRange.start / divLength);
        for (var i = 0; i < (baseDiv + 1); i++) {
            var baseRatio = (((firstBase + i) * divLength) - trackRange.start) / newLength;
            var baseStart = startNumPosy + trackLength * baseRatio;
            ///////////////////cases for adjusting basebox for panning
            if (baseStart + divHeight > endNumPosy) {   /////////case 1: baseStart is above the end num posy but ends below
                baseHeight = endNumPosy - baseStart;
            } else {
                if (baseStart < startNumPosy) {
                    if (baseStart + divHeight < startNumPosy) { ////////case 2: baseStart begins and ends before startNumPosy
                        baseHeight = 0;
                    } else { baseHeight = baseStart + divHeight - startNumPosy; }  ////////case 3: starts before but ends inside
                } else { baseHeight = divHeight; } //////basebox height equals divheight
            }
            if (baseStart > endNumPosy) {   //////////case 3: baseStart is below endPosNumy
                baseStart = endNumPosy;
                baseHeight = 0;
            }
            baseStart = Math.max(startNumPosy, Math.min(endNumPosy, baseStart));/////////restricts baseStart to start and end numPosy
            ctx.strokeRect(startBaseboxx, baseStart, baseboxWidth, baseHeight);
        }
        //////////////////////////////////////////////////////////////////////////////////
        /////////////draw the positions of 5 ticks to better gauge lengths on tracks//////
        //////////////////////////////////////////////////////////////////////////////////
        var tickLength = newLength / 5;
        var firstTick = Math.floor(trackRange.start / tickLength);
        for (var i = 0; i < 7; i++) {
            var tickRatio = (((firstTick + i) * tickLength) - trackRange.start) / newLength; ///////like geneRatio, it calculates the percentage of the way for current tick
            var tickNum = Math.trunc(trackRange.start + (tickRatio * newLength));   //////calculates new tick number and truncates for no decials
            var tickPosy = startNumPosy + trackLength * tickRatio;
            if (firstTick + i % 2 == 0) {           //////should alternate width of ticks but doesn't really work right now
                var tickStart = relativeBoxx - trackWidth * 0.075;
                var tickEnd = relativeBoxx + trackWidth * 0.075;
            } else {
                var tickStart = relativeBoxx - trackWidth * 0.05;
                var tickEnd = relativeBoxx + trackWidth * 0.05;
            }
            if (tickPosy < startNumPosy) {
            } else if (tickPosy > endNumPosy) {

            } else {
                ctx.fillText(shortNum(tickNum, newLength), startNumPosx, tickPosy);
                ctx.moveTo(tickStart, tickPosy);
                ctx.lineTo(tickEnd, tickPosy);
                ctx.stroke();
            }

        }

        ////////////////////////////////////////////////////////
        /////////////Draw in bases/////////////////////////////
        ///////////////////////////////////////////////////////
        var baseY = startNumPosy + (divHeight / 2);
        var baseX = startBaseboxx + (baseboxWidth * 0.75);
        if (newLength <= 100) {
            for (var i = 0; i < 100; i++) {
                ctx.font = "8px Arial";
                ctx.fillText("A", startBaseboxx, baseY); //////do a's for now but create function to grab the correct base
                baseY += divHeight;
            }
        }
        ctx.globalAlpha = 1.0;
        ctx.closePath();
    }


    //drawGenome(scale,windowOrigin) {
    //    var chromName, trackName, boxWindow, trackPos, trackRange;
    //    for (var i = 0; i < this.numChrom; i++) {
    //        chromName = this.chromNames[i];
    //        boxWindow = this.chromosomes[i].boxWindow;
    //        trackRange = this.chromosomes[i].trackRange;
    //        this.chromosomes[i].drawChromosome(scale, windowOrigin, this.defaultcentPos, this.trackPos[this.chromNames[i]]);
    //        this.drawGenomeTrack(boxWindow, trackRange, windowOrigin, scale, this.chromLengths[i]);
    //        for (var x = 0; x < this.tracks.length; x++) {
    //            trackPos = this.trackPos[chromName][x];
    //            trackName = this.trackMap[x][chromName];
    //            this.tracks[x].drawTrack(trackName, boxWindow, trackPos,trackRange,windowOrigin,scale,this.chromLengths[i]);
    //        }
    //    }
    //}

    draw(scale, windowOrigin) {
        var chromName, trackName, boxWindow, trackPos, trackRange;
        for (var i = 0; i < this.numChrom; i++) {
            chromName = this.chromNames[i];
            boxWindow = this.chromosomes[i].boxWindow;
            trackRange = this.chromosomes[i].trackRange;
            this.chromosomes[i].drawChromosome(scale, windowOrigin, this.defaultcentPos);
            for (var x = 0; x < this.tracks.length; x++) {
                trackName = this.trackMap[x][chromName];
                this.tracks[x].drawTrack(trackName, boxWindow, x, trackRange, windowOrigin, scale, this.chromLengths[i]);
            }
            this.drawGenomeTrack(boxWindow, trackRange, windowOrigin, scale, this.chromLengths[i]);
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
    drawChromosome(scale, windowOrigin, centPos) {
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
    } 

}