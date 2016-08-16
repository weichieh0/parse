var createMarker = function (position, type) {
    var marker;
    if (type == "start") {
        marker = new google.maps.Marker({
            position: position,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#FFFFFF',
                fillOpacity: 0.6,
                strokeColor: '#FF0000',
                strokeWeight: 3,
                scale: 8
            }
        });
    } else if (type == "track") {
        marker = new google.maps.Marker({
            position: position,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#FFFFFF',
                fillOpacity: 0.6,
                strokeColor: '#00FF00',
                strokeWeight: 2,
                scale: 6
            }
        });

    } else if (type == "end") {
        marker = new google.maps.Marker({
            position: position,
            animation: google.maps.Animation.BOUNCE,
            icon: 'images/ic_driver_location.png'
        });
    } else if (type == "sendTo") {
        marker = new google.maps.Marker({
            position: position,
            icon: 'images/ic_flag.png'
        });
    } else if (type == "store") {
        marker = new google.maps.Marker({
            position: position,
            icon: 'images/ic_store_location.png'
        });
    }

    return marker;
};

var addSendToMarkerInMap = function (customerInCart, map) {
    var sendToPostion = new google.maps.LatLng(customerInCart.get('location').latitude, customerInCart.get('location').longitude);
    var marker = createMarker(sendToPostion, "sendTo");
    marker.setMap(map);


    var date = "<p><b>" + customerInCart.get('contact') + "</b></p>"
        + "<p>" + "送達時間:" + format(customerInCart.get("ETA"), '<b>hh:mm</b>') + "</p>";
    /*+ "<p>" + customerInCart.get('address') + "</p>";*/

    var infowindow = new google.maps.InfoWindow({
        content: date
    });

    infowindow.open(map, marker);
    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
};

var addStoreMarkerInMap = function (storeInCart, map) {

    var store = storeInCart.get('store');

    var geo = store.get("geoLocation");

    var storePostion = new google.maps.LatLng(geo.latitude, geo.longitude);

    var marker = createMarker(storePostion, "store");

    marker.setMap(map);

    var infowindow = new google.maps.InfoWindow({
        content: store.get("storeName")
    });

    infowindow.open(map, marker);

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

};

var addBeeMarkerInMap = function (beePostion, number, map) {

    var geo = beePostion.get("location");

    var postion = new google.maps.LatLng(geo.latitude, geo.longitude);

    var marker = createMarker(postion, "track");
    marker.setMap(map);
    //marker.latlng = beePostion;

    var accuracy = beePostion.get("accuracy") != null ? beePostion.get("accuracy") : "none";
    var date = number + ". " + format(beePostion.get("createdAt"), '<b>hh:mm</b>') + "<br> 誤差約: " + accuracy + " 公尺";

    var infowindow = new google.maps.InfoWindow({
        content: date
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    return marker;
};

var addBeeMarkerStartInMap = function (beePostion, map) {

    var geo = beePostion.get("location");

    var postion = new google.maps.LatLng(geo.latitude, geo.longitude);

    var marker = createMarker(postion, "start");
    marker.setMap(map);
    //marker.latlng = beePostion;
    var accuracy = beePostion.get("accuracy") != null ? beePostion.get("accuracy") : "none";
    var date = "起始點<br>" + format(beePostion.get('createdAt'), '<b>hh:mm</b>') + ")<br> 誤差約: " + accuracy + " 公尺";

    var infowindow = new google.maps.InfoWindow({
        content: date
    });
    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    return marker;
};

var addBeeMarkerEndInMap = function (beePostion, map) {

    var geo = beePostion.get("location");

    var postion = new google.maps.LatLng(geo.latitude, geo.longitude);

    var marker = createMarker(postion, "end");
    marker.setMap(map);
    //marker.latlng = beePostion;
    var accuracy = beePostion.get("accuracy") != null ? beePostion.get("accuracy") : "none";
    var date = "小蜜蜂最後位置(" + format(beePostion.get('createdAt'), '<b>hh:mm</b>') + ")<br> 誤差約: " + accuracy + " 公尺";

    var infowindow = new google.maps.InfoWindow({
        content: date
    });
    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

    return marker;
};


var drawMarkerInMap = function (hbLocations, map) {

    var markers = [];
    if (hbLocations == null || hbLocations.length == 0) {
        return markers;
    }

    var startMarker = addBeeMarkerStartInMap(hbLocations[0], map, markers);
    markers.push(startMarker);

    for (var i = 1, len = hbLocations.length - 1; i < len; i++) {
        //console.log(hbLocations[i].id);
        var trackMarker = addBeeMarkerInMap(hbLocations[i], i, map, markers);
        markers.push(trackMarker);
    }

    var endMarker = addBeeMarkerEndInMap(hbLocations[hbLocations.length - 1], map, markers);
    markers.push(endMarker);

    return markers;
};

var drawPathInMap = function (hbLocations, map) {
    var trip = [];
    for (var i = 0, len = hbLocations.length; i < len; i++) {
        var location = new google.maps.LatLng(hbLocations[i].get('location').latitude, hbLocations[i].get('location').longitude);
        trip.push(location);
    }

    var newPath = new google.maps.Polyline({
        path: trip,
        strokeColor: "gray",//"#0000FF"
        strokeOpacity: 0.7,
        strokeWeight: 1
    });

    newPath.setMap(map);
    return newPath;
};

var getAllHBLocations = function (cart, provider, callback) {
    var result = [];
    var processCallback = function (res) {
        result = result.concat(res);

        if (res.length == 1000) {
            process(res[res.length - 1].get('currentDate'));
            return;
        }

        callback(result);

    };

    var process = function (skip) {
        console.log("process start");
        var HBBeeLocation = Parse.Object.extend("HBBeeLocation");
        var query = new Parse.Query(HBBeeLocation);

        if (skip) {
            query.greaterThan("currentDate", skip);
        }

        if (provider != null && provider !== "all" ) {
            query.equalTo("provider", provider);
        }

        query.equalTo("cart", cart);

        query.limit(1000);
        query.ascending("currentDate");
        query.find().then(function querySuccess(res) {
            processCallback(res);
        }, function queryFailed(error) {
        });

    };

    process(false);
};


var goodHBLocation = function (hbLocations) {

    function calcDistance(p1, p2) {
        return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(3);
    }

    var convertLocation = function (location) {
        var postion = new google.maps.LatLng(location.latitude, location.longitude);

        return postion;
    };


    if (hbLocations.length == 0) {
        return hbLocations;
    }

    var lastIndex = hbLocations.length-1;
    var result = [];

    hbLocations.forEach(function (location, index, array) {
    
        if (index == 0 || index == lastIndex) {
            //lastLocation = location;
            result.push(location);

        } else {
            preLocation = hbLocations[index + 1];

            if ((location.get("accuracy") == null || location.get("accuracy") <= 50) /*&& (location.get("provider") == null || location.get("provider") === provider || provider === "all")  /* && speed < 150/* && diffTime > 10000 /*distance >= 0.03 && speed < 200 && diffTime > 15000*/) {
                result.push(location);
                //lastLocation = location;
            }
        }
    });

    return result;
};

// Sets the map on all markers in the array.
function setMapOnAll(markers, map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers(markers) {
    setMapOnAll(markers, null);
}

function clearPath(path) {
    path.setMap(null);
}

		var snappedCoordinates = [];
		var snappedPolyline;
		var snappedPolylineArray = [];

		function runSnapToRoad(locations,map) {
	
			snappedPolylineArray.forEach(function(polyline,index,array){
				polyline.setMap(null);
			});
			
			snappedPolylineArray.length = 0;
			
			var paths="";
			var num = locations.length/100;
			var tmpLocation = locations[0];
			var newLocation = [];
			newLocation.push(tmpLocation);
				
			for(var i =0 ;i<locations.length;i++){
				var distance = getDistance(tmpLocation.get("location"),locations[i].get("location"));
					
				if(distance>30){
					tmpLocation = locations[i];
					newLocation.push(tmpLocation);
				}
			}
			
			// alert(newLocation.length);
			
			var circleNum = parseInt( newLocation.length / 100 + 1);
			
			for(var i =0;i<circleNum;i++){
				var paths="";
				
				for(var j=0;j<100;j++){
					var n = i*100 + j;
					
					if(n < newLocation.length){
						paths +=  newLocation[n].get("location").latitude + "," + newLocation[n].get("location").longitude;
				 	}
				 	
				 	if(j == 99 || n == newLocation.length-1){
				 		
				 		$.get('https://roads.googleapis.com/v1/snapToRoads?path='+ paths +'&interpolate=true&key=AIzaSyDT_nh0aKxv4aZ263b5RGYCDRD-vjCozj0'
							, function(data) {
					 		processSnapToRoadResponse(data);
					 		drawSnappedPolyline(map);
						});
						
						
						if(n == newLocation.length-1){
							
							break;
						}
						
						
				 	}else{
				 		paths += "|";
				 	}

				}

			}

			// for(var i =0;i<100;i++){
				// var n = parseInt(i*num);
				// if(n < newLocation.length && i!=99){
					// paths +=  newLocation[n].get("location").latitude + "," + newLocation[n].get("location").longitude;
				 	// paths += "|";
				// }else{
					// paths +=  newLocation[newLocation.length-1].get("location").latitude + "," + newLocation[newLocation.length-1].get("location").longitude;
					// break;
				// }
			// }
// 
			// $.get('https://roads.googleapis.com/v1/snapToRoads?path='+ paths +'&interpolate=true&key=AIzaSyDT_nh0aKxv4aZ263b5RGYCDRD-vjCozj0'
				// , function(data) {
					 // processSnapToRoadResponse(data);
					 // drawSnappedPolyline(map);
				// });
				
		}
			
		// Store snapped polyline returned by the snap-to-road method.
		function processSnapToRoadResponse(data) {
  			snappedCoordinates = [];
  			placeIdArray = [];
  			for (var i = 0; i < data.snappedPoints.length; i++) {
    			var latlng = new google.maps.LatLng(
        		data.snappedPoints[i].location.latitude,
        		data.snappedPoints[i].location.longitude);
    			snappedCoordinates.push(latlng);
    			placeIdArray.push(data.snappedPoints[i].placeId);
  			}
		}
			
		// Draws the snapped polyline (after processing snap-to-road response).
		function drawSnappedPolyline(map) {
			// if(snappedPolyline!=null){
				// snappedPolyline.setMap(null);
			// }
// 			
			
			
			snappedPolyline = new google.maps.Polyline({
				path : snappedCoordinates,
				strokeColor : 'blue',
				strokeOpacity: 0.5,
				strokeWeight : 5
			});

			snappedPolyline.setMap(map);
			snappedPolylineArray.push(snappedPolyline);
		}

