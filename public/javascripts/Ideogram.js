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
function drawBorder(ctx, xPos, yPos, width, height, radius, color = '#000', thickness = 1) {
    ctx.beginPath();
    ctx.fillStyle = color;
    roundedRect(ctx, xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2),radius + (thickness*2));
    ctx.closePath();
}
////////////////////////////////////////////////////////////////////////////////////////

///////////////////Base function to draw a rounded rectangle with a border/////////////////////
function drawBorderedRect(ctx, x, y, height, width, borderColor) {

    var rectXPos = x; ////////////Set the dimensions ////might need this to be variable when adding chrom sizes. 
    var rectYPos = y;
    var rectWidth = height; ////50*scale;
    var rectHeight = width; ///250*scale;
    var rectRadius = width/10;

    drawBorder(ctx,rectXPos, rectYPos, rectWidth, rectHeight, rectRadius, borderColor); //////////Call the border function

    ctx.beginPath(); /////////Draw the inside fill rectangle
    ctx.fillStyle = '#FFF';
    roundedRect(ctx, rectXPos, rectYPos, rectWidth, rectHeight, rectRadius);
    ctx.closePath();
}
////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////Initialize canvas and context///////////////

function drawIdeogram(scale, translatePos, height, width, highlight = false) {
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d'); 
    var borderColor = '#000';
    if (highlight) { borderColor = '#0000FF';}
    context.save()
    context.translate(translatePos.x, translatePos.y); //////////Translate entire context to there
    drawBorderedRect(context, 0, 0, width, height, borderColor);
    context.restore();
}
//////////////////////////////////////////////////////////////////


///////////////Main////////////////////////////
//drawBorderedRect(context, 50, 50, 7); /////////Draw call to HTML file
//drawBorderedRect(context, 100, 100, 7);
////////////////////////////////////////////