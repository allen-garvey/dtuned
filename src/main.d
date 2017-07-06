import std.stdio;
import std.xml;
import std.string;
import std.file;

struct Track{
	int id;
	//int size;
	//int time;
	//int trackNum;
	//int year;
	string name;
	string artist;
	string fileLocation;
}

void parseiTunesLibraryXml(string musicLibraryXmlFilename){
	string s = cast(string) std.file.read(musicLibraryXmlFilename);

    // Check for well-formedness
    //check(s);
    writeln("Done checking if XML is valid");

    Track[] tracks;

    auto xml = new DocumentParser(s);
    xml.onStartTag["dict"] = (ElementParser xml){
   		bool isTracksKey = false;
    	xml.onStartTag["key"] = (ElementParser xml){
	    	xml.onText = (string s){
			    if(s != "Tracks"){
			    	isTracksKey = false;
			    }
			    else{
			    	isTracksKey = true;
			    }
			};
			xml.parse();
	    };
	    xml.onStartTag["dict"] = (ElementParser xml){
	    	if(!isTracksKey){
	    		return;
	    	}
	    	writeln("this is the tracks values");

	    	xml.onStartTag["dict"] = (ElementParser xml){
	    		Track track;

	    		

	    	};
	    	xml.parse();
	    };

	    xml.parse();
    };
    xml.parse();

}


int main(string[] args){
	if(args.length != 2){
		stderr.writef("usage: %s <path to 'iTunes Music Library.xml' file>\n", args[0]);
		return 1;
	}

	string musicLibraryXmlFilename = args[1];

	parseiTunesLibraryXml(musicLibraryXmlFilename);


	return 0;
}