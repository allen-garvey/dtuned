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

function formatRequired(value, isString){
	if(isString){
		return `'${escapeQuotes(value)}'`;
	}
	return value;
}

function formatOptional(value, isString){
	if(value === null || value === undefined){
		return 'NULL';
	}
	return formatRequired(value, isString);
}

function formatLocation(location){
	return decodeURI(location).replace(/^.*iTunes Music\//g, '');
}

function formatDate(date){
	return formatRequired(date.toISOString().replace(/T/, ' ').replace(/\.\d+Z$/, ''), true) + '::timestamp';

}

function formatRequiredUnsignedInt(d){
	if(!d){
		return 0;
	}
	return d;
}

function objToSql(tableName, obj){
	tableNames = [];
	values = [];
	Object.keys(obj).forEach(function(key){
		tableNames.push(key);
		values.push(obj[key]);
	});

	return `INSERT INTO ${tableName}(${tableNames.join(', ')}) VALUES (${values.join(', ')});`

}


function trackToSql(track){
	var trackTable = "tracks";

	var sqlMap = {
		artist: formatOptional(track.Artist, true),
		name: formatRequired(track.Name, true),
		genre: formatOptional(track.Genre, true),
		composer: formatOptional(track.Composer,  true),
		file_size: formatRequired(track.Size),
		total_time: formatRequired(track['Total Time']),
		year: formatRequired(track.Year),
		file_location: formatRequired(formatLocation(track.Location), true),
		date_added: formatDate(track['Date Added']),
		play_count: formatRequiredUnsignedInt(track['Play Count']),
		bit_rate: formatRequiredUnsignedInt(track['Bit Rate'])
	};

	return objToSql(trackTable, sqlMap);
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

