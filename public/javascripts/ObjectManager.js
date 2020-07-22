class ObjectManager {
    //////////////////constructor blank
    constructor() { }

    objects = [];
    objectNames = [];
    objectWindows = [];

    addGenomefromFasta(f) { //////////might change to a general add genome that detects the file type
        var genome = new Genome(); ///create genome object
        var genomeName = f;
        this.objectNames.push(genomeName); //////add objectName
        this.updateWindows(); /////divide into windows correct to new number of objects
        genome.genomeFromFasta(f,this.objectWindows[this.objectNames.length-1]); /////need to add after because needs window
        this.objects.push(genome);  ////add the new genome
        this.updateObjects();   ////////update the old objects to fit in windows
    }

    updateObjects() {///////we need to call this when adding new genomes to set the chrom positions with new window dimensions
        for (var i = 0; i < this.objectNames.length; i++) {
            this.objects[i].update(this.objectWindows[i]);
        }
    }

    updateWindows() {
        this.objectWindows = [];
        var canvas = document.getElementById('myCanvas');
        var canvasX = -(canvas.width / 2); /////////not using translatePos from html, should probably be fine
        var canvasY = -(canvas.height / 2);
        var ydiv, xdiv, tmp, numObjects = this.objectNames.length;
        if (numObjects <= 1) {
            ydiv = 1;
            xdiv = 1;
        } else if (numObjects == 2) {
            ydiv = 1;
            xdiv = 2;
        } else {
            var root = Math.ceil(Math.sqrt(this.objectNames.length));
            ydiv = root;
            xdiv = root;
        }
        ////////////////////We have to create the window for each genome to use to draw all it's elements in different sections of canvas
        var xi, yi, s = -1;
        for (var i = 0; i < numObjects; i++) {
            xi = i % (xdiv);                ////////We need to set everytime moves to end of row back to 0
            if (xi == 0) { s++; }
            yi = s;//s % (1 / ydiv);    
            var wWidth = canvas.width / xdiv;
            var wHeight = canvas.height / ydiv;
            tmp = {
                x: canvasX + ((canvas.width / xdiv) * xi) + (wWidth/2),
                y: canvasY + ((canvas.height / ydiv) * yi) + (wHeight/2),
                width: wWidth,
                height: wHeight,
                boxx: canvasX + ((canvas.width / xdiv) * xi),
                boxy: canvasY + ((canvas.height / ydiv) * yi)
            }
            this.objectWindows.push(tmp);
        }
    }

    addGeneTrackfromFasta(f) {
        this.objects[0].addGeneTrackFromGFF(f);
    }

    updateAll(movePos = { x: 0, y: 0 }, zoom = 1) {
        for (var t = 0; t < this.objectNames.length; t++) {
            ////update the windows here so that they zoom properly
            this.objectWindows[t].x += movePos.x;
            this.objectWindows[t].y += movePos.y;
            this.objectWindows[t].x *= zoom;
            this.objectWindows[t].y *= zoom;
            this.objectWindows[t].boxx += movePos.x;
            this.objectWindows[t].boxy += movePos.y;
            this.objectWindows[t].boxx *= zoom;
            this.objectWindows[t].boxy *= zoom;
            this.objectWindows[t].width *= zoom; ////////this will make it so box/track size does not get smaller when over zoomed
            this.objectWindows[t].height *= zoom;
            for (var i = 0; i < this.objects[t].chromosomes.length; i++) {
                this.objects[t].chromosomes[i].update(movePos.x, movePos.y, zoom);
            }
        }
    }

    whichHover(mouse,windowOrigin) {
        //mousex = event.clientX;
        //mousey = event.clientY;
        var check = false;

        for (var t = 0; t < this.objectNames.length; t++) {
            for (var i = 0; i < this.objects[t].chromosomes.length; i++) {
                check = this.objects[t].chromosomes[i].check(mouse.x, mouse.y, windowOrigin);
                if (check) { return this.objects[t].chromosomes[i]; }
            }
        }
        return null; //////////if we are not hovering we exit with null
    }

    //////////we can draw multiple genomes and they stay in their sections, but track boxes overlap, will need to fix that
    drawObjects(scale, windowOrigin) {
        var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
        for (var i = 0; i < this.objectNames.length; i++) {
            //////////////////Draw window
            ctx.beginPath();
            var window = this.objectWindows[i];
            var x = (window.boxx + (windowOrigin.x));//// / scale;
            var y = (window.boxy + (windowOrigin.y));//// / scale;
            ctx.strokeRect(x, y, window.width, window.height);
            ctx.closePath();
            this.objects[i].draw(scale, windowOrigin); 
        }
    }
}