//var os = require('os');

/////Show free out of total memory
//var totalMemory = os.totalmem()/1000000;
//var freeMemory = os.freemem()/1000000;

//console.log(`Memory: ${freeMemory} MB available of ${totalMemory} MB`)

//console.log('Ideogram drawing');

///////////////////Base function to make a rounded rectangle/////////////////
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.fill();
}
///////////////////////////////////////////////////////////////////////

/////////////////Base function to add a border to a rounded rectangle//////////////
function drawRectBorder(ctx, xPos, yPos, width, height, radius, color = '#000', thickness = 1) {
    ctx.beginPath();
    ctx.fillStyle = color;
    roundedRect(ctx, xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2),radius + (thickness*2));
    ctx.closePath();
}
////////////////////////////////////////////////////////////////////////////////////////

///////////////////Base function to draw a rounded rectangle with a border/////////////////////
function drawBorderedRect(ctx, rectXPos, rectYPos, rectWidth, rectHeight, borderColor) {
    var rectRadius = rectWidth / 2;                     ////////////width / 2 seems to work
    drawRectBorder(ctx, rectXPos, rectYPos, rectWidth, rectHeight, rectRadius, borderColor); //////////Call the border function

    ctx.beginPath(); /////////Draw the inside fill rectangle
    ctx.fillStyle = '#FFF';
    roundedRect(ctx, rectXPos, rectYPos, rectWidth, rectHeight, rectRadius); ////////I know that this is backwards but it doesn't work if its other way
    ctx.closePath();
}

function drawBorderedCircle(ctx, CircXPos, CircYPos, CircRadius, borderColor) {

    drawCircBorder(ctx,CircXPos,CircYPos,CircRadius,borderColor);

    ctx.beginPath();
    ctx.fillStyle = '#FFF';
    ctx.arc(CircXPos, CircYPos, CircRadius, 0, 2 * Math.PI); //////draws full circle centered on middle of circle
    ctx.fill();
    ctx.closePath();
}

function drawCircBorder(ctx, xPos, yPos,radius, color = '#000', thickness = 1) {    /////////1 is too thick
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(xPos, yPos, radius + thickness, 0, 2 * Math.PI); //////draws full circle centered on middle of circle
    ctx.fill();
    ctx.closePath();
}
////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////Initialize canvas and context///////////////

function drawIdeogram(scale, translatePos, height, width, centPos, highlight = false) {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d'); 
    var borderColor = '#000';
    if (highlight) { borderColor = '#0000FF'; }
    var centDiam = (width * 0.5);
    var centRadius = centDiam/2;                //////Radius of centromere
    var centX = (width / 2);
    var centY = (height * centPos);
    var pYend = centY - centRadius;                 //////P arm stops at centromere - radius
    var qYstart = centY + centRadius;               //////q arm starts at centromere + radius
    /////////need to cut up the avail width and height to make a thing in it
    context.save()
    context.translate(translatePos.x, translatePos.y); //////////Translate entire context to there

    //drawBorderedRect(context, -5, -5, width + 10, height + 10, '#FF0000');           ////////////Hitbox representation
    drawBorderedRect(context, 0, 0, width, pYend, borderColor);                /////p arm
    drawBorderedRect(context, 0, qYstart, width, (height - qYstart), borderColor);         /////q arm
    drawBorderedCircle(context, centX, centY, centRadius, borderColor );      //////Draw a circle that is .5*width under tPos.x+height and 
    
    context.restore();
}
//////////////////////////////////////////////////////////////////


///////////////Main////////////////////////////
//drawBorderedRect(context, 50, 50, 7); /////////Draw call to HTML file
//drawBorderedRect(context, 100, 100, 7);
////////////////////////////////////////////