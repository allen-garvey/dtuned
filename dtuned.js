var fs = require('fs');
var parse = require('fast-plist').parse;

var musicLibrayXmlFilename = process.argv[2];

if(!musicLibrayXmlFilename){
	console.error("usage: " + process.argv[0] + " " + process.argv[1] + ' <path to "iTunes Music Library.xml">');
	process.exit(1);
}
 
var plist = parse(fs.readFileSync(musicLibrayXmlFilename, 'utf8'));


var tracks = plist.Tracks; 

for(var id in tracks){
	var track = tracks[id];
	console.log(track.Name);
}


