var getHosts = RESTHostManager.getHosts()
for(var restHostId in getHosts){	
	var restHost = RESTHostManager.getHost(getHosts[restHostId])
	if(restHost.name == "NSXT"){		
		var host = restHost;
	}
}

var transientHost = RESTHostManager.createTransientHostFrom(host);
transientHost.url =  "https://172.30.77.57/";

if(!spoofguard_profile){
    spoofguard_profile = "default-spoofguard-profile";
}
if(!security_profile){
    security_profile = "default-segment-security-profile";
}
if(!ip_discovery_profile){
    ip_discovery_profile = "default-ip-discovery-profile";
}
if(!mac_discovery_profile){
    mac_discovery_profile = "default-mac-discovery-profile";
}

try {
    // Trying to create a segment
    var transportZoneID = "316a2c54-542d-48b5-8cc7-ed1772b88598";

    var body = {
        "display_name": segmentName,
        "transport_zone_path": "/infra/sites/default/enforcement-points/default/transport-zones/" + transportZoneID
    };
    var request = transientHost.createRequest("PUT", "policy/api/v1/infra/segments/"+segmentName, JSON.stringify(body));
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");

    var response = request.execute();
    if (response.statusCode != 200) {
        System.log(response.statusCode)
        System.log(response.contentAsString)
        throw("Cannot create a segment "+ segmentName );
    }

    var segment = JSON.parse(response.contentAsString);

    body = {
        "resource_type": "SegmentSecurityProfileBindingMap",
        "spoofguard_profile_path": "/infra/spoofguard-profiles/" + spoofguard_profile,
        "segment_security_profile_path": "/infra/segment-security-profiles/" + security_profile
    };
    var request = transientHost.createRequest("PATCH", "policy/api/v1/infra/segments/"+segmentName+"/segment-security-profile-binding-maps/"+segment.unique_id, JSON.stringify(body));
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");
    
    var response = request.execute();
    if (response.statusCode != 200) {
        throw("Cannot bind security profiles for "+ segmentName );
    }

    body = {
        "resource_type":" SegmentDiscoveryProfileBindingMap",
        "mac_discovery_profile_path":"/infra/mac-discovery-profiles/" + mac_discovery_profile,
        "ip_discovery_profile_path":"/infra/ip-discovery-profiles/" + ip_discovery_profile
    };
    var request = transientHost.createRequest("PATCH", "policy/api/v1/infra/segments/"+segmentName+"/segment-discovery-profile-binding-maps/"+segment.unique_id, JSON.stringify(body));
    request.contentType = "application/json";
    request.setHeader("Accept", "application/json");
    var response = request.execute();
    if (response.statusCode != 200) {
        System.log(response.contentAsString);
        throw("Cannot bind discovery profiles for "+ segmentName );
    }

    System.log( "The segment " + segmentName + " (" + segment.id + ") is created");
    return segment.id;

} catch (e) {
   System.error(e);
}