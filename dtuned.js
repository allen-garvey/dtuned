var fs = require('fs');
var parse = require('fast-plist').parse;

var musicLibrayXmlFilename = process.argv[2];

if(!musicLibrayXmlFilename){
	console.error("usage: " + process.argv[0] + " " + process.argv[1] + ' <path to "iTunes Music Library.xml">');
	process.exit(1);
}

function escapeQuotes(s){
	return s.replace(/'/g, "''");
}

function formatOptional(track, keyName, isString){
	var value = track[keyName];
	if(!value){
		return 'NULL';
	}
	if(isString){
		return `'${escapeQuotes(value)}'`;
	}
	return value;
}

function formatLocation(location){
	return escapeQuotes(decodeURI(location).replace(/^.*iTunes Music\//g, ''));
}

function trackToSql(track){
	var trackTable = "tracks";
	var composer = formatOptional(track, 'Composer', true);
	var artist = formatOptional(track, 'Artist', true);

	return `INSERT INTO ${trackTable}(name, artist, file_size, total_time, year, composer, file_location) VALUES ('${escapeQuotes(track.Name)}', ${artist}, ${track["Size"]}, ${track["Total Time"]}, ${track["Year"]}, ${composer}, ${formatLocation(track.Location)});`;
}

function printKeys(obj){
	function formatKey(s){
		return `'\${track["${s}"]}'`
	}
	console.log(Object.keys(obj).map(formatKey).join(', '));
}

function printKinds(tracks){
	var kinds = new Map();

	for(var id in tracks){
		var track = tracks[id];

		if(!kinds.has(track.Kind)){
			kinds.set(track.Kind, 1);
		}
		else{
			kinds.set(track.Kind, kinds.get(track.Kind) + 1);
		}
	}
	console.log(kinds.entries());
}


var plist = parse(fs.readFileSync(musicLibrayXmlFilename, 'utf8'));


var tracks = plist.Tracks; 



for(var id in tracks){
	var track = tracks[id];
	if(!track.Kind.match(/\baudio\b/)){
		continue;
	}
	console.log(trackToSql(track));

	// printKeys(track);
	// break;
}

