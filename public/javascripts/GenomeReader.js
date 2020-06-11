//var fs = require('fs');
//var csv = require('jquery-csv');
//var sample = './data/sample.csv';
//import * as d3 from './d3.js';
//import * as d3 from 'https://unpkg.com/d3?module'

//define(function (require) {
//    var namedModule = require('name');
//});
//require(['fs'], function (foo) {
//    //foo is now loaded.
//});

//export function readGenomeFromBed(sample) {
//    d3.tsv(sample).then(function (data) {
//        console.log(data[0]);
//    });
//    return data;
//}

function readFile(file) { //////////this works for specifying the file in JS
    var f = new XMLHttpRequest();
    f.open("GET", file, false);
    f.onreadystatechange = function () {
        if (f.readyState === 4) {
            if (f.status === 200 || f.status == 0) {
                var res = f.responseText;
                //alert(res); ///////prints to an alert don't want that
            }
        }
    }
    f.send(null);
    return f;
}
////////////Get all values for key, automatically a string because that is how it is read in from readFile
function select(obj,key,type = 'str') {
    var arr = [];
    var tmp = null;
    for (i = 0; i < obj.length; i++) {
        if (type == 'num') { tmp = Number(obj[i][key]); } else { tmp = obj[i][key]; }
        arr.push(tmp);
    }
    return arr;
}


///////BED reader based on UCSC format: https://genome.ucsc.edu/FAQ/FAQformat.html#format1
function bedToJSON(bedText) {
    var lines = bedText.split(/\r\n|\r|\n/g),
        //GFF3 Header Structure
        headers12 = ['chrom', 'chromStart', 'chromEnd', 'name', 'score', 'strand', 'thickStart', 'thickEnd', 'itemRgb', 'blockCount', 'blockSizes', 'blockStarts'],
        header,
        obj,
        currentline,
        matches,
        curr,
        i,
        j,
        n = 0,
        isHeader = false,
        firstline = lines[0].split("\t");
        result = [];
    ///////////Determine the type of BED to use
    if (firstline[0].startsWith('chrom') | firstline[0].startsWith('Chrom')) { isHeader = true; }////////checks if there is a header
    
    if (isHeader) { header = firstline; n = 1; }
    else if (firstline.length == 3) { header = headers12.slice(0,3); }
    else if (firstline.length == 6) { header = headers12.slice(0,6); }
    else if (firstline.length == 12) { header = headers12; }
    else {
        header = headers12.slice(0,3); 
        for (i = 3; i < firstline.length; i++) {
            header.push( ('y' + (i-2)) );
        }
    }
     
    ////////////Save the bed in to a JSON object
    
    for (i = 0+n; i < lines.length; i += 1) {
        //Create a gff object
        obj = {};
        currentline = lines[i].split("\t");
        //Ignore lines starting with metadata
        //if (currentline[0].startsWith('chr') && currentline.length === header.length) { ///////doesn't work with mito
        if (currentline.length === header.length) {
            for (j = 0; j < header.length; j += 1) {
                obj[header[j]] = currentline[j];
            }
            //Put objects into an array called results
            result.push(obj);
        }
    }
    
    //Return the JSON string
    //console.log(result);
    return JSON.parse(JSON.stringify(result));
    //return result; ////test for not using JSON
}

/////////////taken from http://spareinformatics.blogspot.com/2014/01/converting-gff-files-to-json-in.html
function gffToJSON(gffText) {
    var lines = gffText.split(/\r\n|\r|\n/g),
        //GFF3 Header Structure
        headers = ['seqid', 'source', 'type', 'start', 'end', 'score', 'strand', 'phase', 'attributes'],
        obj,
        currentline,
        matches,
        curr,
        i,
        j,
        result = [];
    for (i = 0; i < lines.length; i += 1) {
        //Create a gff object
        obj = {};
        currentline = lines[i].split("\t");
        //Ignore lines starting with # or malformed
        if ('#' !== currentline.slice(0, 1) && currentline.length === 9) {
            for (j = 0; j < 9; j += 1) {
                obj[headers[j]] = currentline[j];
            }
            //If the line doesn't end with a semicolon, tack one on
            if (currentline[8].slice(currentline[8].length - 1, currentline[8].length) !== ';') currentline[8] += ';';
            curr = currentline[8].split(';');
            for (j = 0; j < curr.length; j += 1) {
                //Regular expression for annotations
                if (/.*=.*/.test(curr[j])) {
                    matches = curr[j].match('(.*)=(.*)');
                    obj[matches[1]] = matches[2];
                }
            }
            //Put objects into an array called results
            result.push(obj);
        }
    }
    //Return the JSON string
    return JSON.parse(JSON.stringify(result));  ///////returns as parsed json so that I can query it
}