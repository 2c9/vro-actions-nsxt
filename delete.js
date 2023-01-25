var getHosts = RESTHostManager.getHosts()
for(var restHostId in getHosts){	
	var restHost = RESTHostManager.getHost(getHosts[restHostId])
	if(restHost.name == "NSXT"){		
		var host = restHost;
	}
}

var transientHost = RESTHostManager.createTransientHostFrom(host);
transientHost.url =  "https://172.30.77.57/";

try {
    // Trying to get the segment id

    var query = 'resource_type:Segment AND display_name:"'+ segmentName +'"';
    var encoded_query = encodeURIComponent(query);
    var request = transientHost.createRequest("GET", "policy/api/v1/search?query="+encoded_query);
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");
    var response = request.execute();
    if (response.statusCode != 200) {
        throw("Cannot get the segment "+ segmentName );
    }
    var segments = JSON.parse(response.contentAsString)["results"];
    if( segments.length != 1 ){
        throw("The segment does not exist OR there are more then one segment with name \""+ segmentName +"\"" );
    }

    var segment_id = segments[0]["id"];

    // Trying to get security bindings

    var request = transientHost.createRequest("GET","policy/api/v1/infra/segments/"+segment_id+"/segment-security-profile-binding-maps");
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");
    var response = request.execute();
    if (response.statusCode != 200) {
        throw("Cannot get segment bindings for "+ segmentName );
    }
    var security_bindings = JSON.parse(response.contentAsString)["results"];
    for(var i in security_bindings){
        var bind = security_bindings[i];
        var request = transientHost.createRequest("DELETE","policy/api/v1"+bind["path"]);
        request.execute();
    }
    
    // Trying to get discovery bindings

    var request = transientHost.createRequest("GET","policy/api/v1/infra/segments/"+segment_id+"/segment-discovery-profile-binding-maps");
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");
    var response = request.execute();
    if (response.statusCode != 200) {
        throw("Cannot get segment bindings for "+ segmentName );
    }
    
    var discovery_bindings = JSON.parse(response.contentAsString)["results"];
    for(var i in discovery_bindings){
        var bind = discovery_bindings[i];
        var request = transientHost.createRequest("DELETE","policy/api/v1"+bind["path"]);
        request.execute();
    }

    // Trying to remove the segment
    
    var request = transientHost.createRequest("DELETE","/policy/api/v1/infra/segments/"+segment_id);
    var response = request.execute();
    if (response.statusCode != 200) {
        throw( "Failed to remove " + segmentName );
    }
    System.log(segmentName + " is removed");

} catch (e) {
    System.error(e);
}