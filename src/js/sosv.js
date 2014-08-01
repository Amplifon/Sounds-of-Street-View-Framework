
var getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
};

var devMode = getUrlVars().dev;

var rad = function(x) {
	return x * Math.PI / 180;
};

var Distance = function(p1, p2, metric){
	var R = 6378137, 	// Earth’s mean radius in meter
		dLat = rad(p2.lat() - p1.lat()),
		dLong = rad(p2.lng() - p1.lng()),
		a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong / 2) * Math.sin(dLong / 2),
		c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
		d = R * c;		// d = the distance in meter

		if (metric == 'miles') {		// convert to miles?
			d = d * 0.000621371192;
		}
	
	return d; 			
}

var Sound = function(json, panorama, _sosv){

	var obj 	= this;
	this.sosv 	= _sosv;
	this.data 	= json;			// JSON data associated with this sound
	this.map 	= panorama;		// Street view pano we are working with
		
	this.sound 	= null;			// Howler object
	this.vol 	= 0;			// Volume of sound		

	this.position 			= new google.maps.LatLng(this.data.lat, this.data.lng);
	this.prevUserPosition 	= { lat: null, lng: null };
	this.prevVolume 		= 0;

	this.init = function(){

		// Listen for user position change events
		$(document.body)
			.on('panoChanged', 		this.onUserMovement)
			.on('positionChanged', 	this.onUserMovement)
			.on('povChanged', 		this.onUserMovement);

		this.createSound();
		this.addSoundToMap();
	};

	this.createSound = function(){
		
		// Only use loop if pause = 0
		var loop = (!parseFloat(obj.data.pause)) ? true : false;

		obj.sound = new Howl({  
			urls: obj.data.src, 
			loop: loop,
			onload: obj.onSoundLoaded,
			onloaderror: obj.onSoundLoadError
		});
	};

	this.onSoundLoaded = function(e){

		$(document.body).trigger('soundLoaded', obj.data);
	};

	this.onSoundLoadError = function(e){

		$(document.body).trigger('soundLoadError', obj.data);
	};

	this.addSoundToMap = function(){

		obj.data.icon = (devMode) ? 'data:image/gif;base64,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' : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		obj.data.draggable = (devMode) ? true : false;
		obj.sosv.addMarker(obj.data);

		this.updatePan();
	};

	this.playSound = function(){

		obj.sound.play();

		// Manually loop the sound, interspesed with pauses, if we have a pause value for this object
		if (parseFloat(obj.data.pause)) {
			
			obj.sound.on('end', function(){
				
				obj.sound.pause();

				setTimeout(function(){
					obj.sound.play();
				}, parseInt(obj.data.pause));

			});
		}
	};

	this.stopSound = function(){
		obj.sound.stop();
	};

	this.unloadSound = function(fadeSpeed){

		obj.sound.fade(obj.vol, 0, fadeSpeed, function(){
			obj.sound.unload();
		});

		// Sometimes the fade callback does not fire, so manually unload sound after fade length as failsafe
		setTimeout(function(){
			if (obj.sound) {
				obj.sound.unload();
			}
		}, (fadeSpeed+50));
	};

	this.onUserMovement = function(e, pano){
		
		// Get current position data for the user
		var lat 		= pano.getPosition().lat(),
			lng 		= pano.getPosition().lng(),
			heading 	= pano.getPov().heading;

		obj.updatePan(lat, lng, heading);
		obj.updateVolume(lat, lng, pano);
	};

	this.updatePan = function(lat, lng, heading){

		var xDiff = obj.data.lat - lat,
			yDiff = obj.data.lng - lng,
			angle = Math.atan2(yDiff, xDiff) * (180/Math.PI);

		// Add POV heading offset
		angle -= heading;

		// Convert angle to range between -180 and +180
		if (angle < -180) 		angle += 360;
		else if (angle > 180) 	angle -= 360;

		// Calculate panPosition, as a range between -1 and +1
		var panPosition = (angle/90);
		if (Math.abs(panPosition) > 1) {
			var x = Math.abs(panPosition) - 1;
			panPosition = (panPosition > 0) ? 1 - x : -1 + x;
		}

		// Set the new pan poition
		obj.sound.pos3d(panPosition, 1, 1);

		// Apply lowpass filter *if* the sound is behind us (11,000hz = filter fully open)
		var freq = 11000;
		if (Math.abs(angle) > 90) {
			// User's back is to the sound - progressively apply filter
			freq -= (Math.abs(angle) - 90) * 55;
		}
		obj.sound.filter(freq);
	};

	this.updateVolume = function(lat, lng, pano){

		if (lat !== obj.prevUserPosition.lat || lng !== obj.prevUserPosition.lng) {

			// Calculate distance between user and sound
			var distance = Distance(obj.position, pano.getPosition());
			
			// Calculate new volume based on distance
			obj.vol = obj.calculateVolume(distance);

			// Set new volume
			obj.sound.fade(obj.prevVolume, obj.vol, 500);

			// Cache the new volume / position for checking next time 
			obj.prevVolume = obj.vol;
			obj.prevUserPosition.lat = lat;
			obj.prevUserPosition.lng = lng;
		}
	};

	this.calculateVolume = function(distance){
		// Calculate volume by using Inverse Square Law
		obj.vol = 1 / (distance * distance);
		// Multiply distance volume by amplitude of sound (apply ceiling max of 1)
		obj.vol = Math.min((obj.vol * obj.data.db), 1);
		return obj.vol;
	};

	this.init();
}

var SOSV = function(jsonPath){
	
	var self = this,
		el,
		panorama,
		markers = [],
		arrSounds = [],
		soundCount = 0;

	this.init = function(){
		
		// Test for presence of Web Audio API
		if (!this.webApiTest) {
			alert('Your browser does not support the Web Audio API!');
			return;
		}

		$(document.body)
			.on('soundLoaded', this.onSoundLoaded)
			.on('soundLoadError', this.onSoundLoaded)
			.on('changeLocation', this.onChangeLocation)
			.on('panoChanged', this.showUserData)
			.on('povChanged', this.showUserData)
			.on('positionChanged', this.showUserData)
			.on('markerClicked',  this.showMarkerData)
			.on('markerDragEnd', this.showMarkerData);

		if (devMode) {
			this.addDevModeMarkup();
		}
		
		// Load JSON data
		$.getJSON(jsonPath, this.onJsonLoaded); 
	};

	this.webApiTest = function(){
		var waAPI;
		if (typeof AudioContext !== "undefined") {
		    waAPI = new AudioContext();
		} else if (typeof webkitAudioContext !== "undefined") {
		    waAPI = new webkitAudioContext();
		}
		return (waAPI) ? true : false;
	};

	this.onJsonLoaded = function(data){
		
		soundCount = data.sounds.length;

		self.createStreetView(data);
		self.loadSounds(data);

		// Manually trigger onSoundLoaded if there are no sounds in the json data
		if (!soundCount) {
			self.onSoundLoaded(null);
		}
	};

	this.createStreetView = function(data){
		
		el = $('#'+data.id);
		panorama = new google.maps.StreetViewPanorama(document.getElementById(data.id), {
				
			position 			: new google.maps.LatLng(data.lat, data.lng),
			pov: {
			  	heading 		: Number(data.heading),
			  	pitch 			: Number(data.pitch)
			}
		});
		// add listeners
		google.maps.event.addListener(panorama, 'pano_changed', 	this.onPanoChanged);
		google.maps.event.addListener(panorama, 'position_changed', this.onPositionChanged);
		google.maps.event.addListener(panorama, 'pov_changed', 		this.onPovChanged);
	};

	this.addMarker = function(data){
		
		var marker = new google.maps.Marker({
		    map 		: panorama,
		    title 		: data.name,
		    position 	: new google.maps.LatLng(data.lat, data.lng),
		    draggable 	: data.draggable,
		    icon 		: data.icon
		});
		markers.push(marker);

		google.maps.event.addListener(marker, 'click', function(e) {
			$(document.body).trigger('markerClicked', [e, marker, data]);
		});

		google.maps.event.addListener(marker, "dragend", function(e) { 
			$(document.body).trigger('markerDragEnd', [e, marker, data]);
        });
	};

	this.onPanoChanged = function(e){
		el.trigger('panoChanged', panorama);
	};

	this.onPositionChanged = function(e){
		el.trigger('positionChanged', panorama);
	};

	this.onPovChanged = function(e){
		el.trigger('povChanged', panorama);
	};

	this.loadSounds = function(data){
		
		// Create all the sounds objects, and store in array
		for (var i=0; i < data.sounds.length; i++) {
			var sound = new Sound(data.sounds[i], panorama, self);
			arrSounds.push(sound);
		}
	};

	this.onSoundLoaded = function(e){

		soundCount--;

		// All sounds loaded?
		if (soundCount <= 0) {
			self.playSounds();
		}
	};

	this.playSounds = function(){

		// Start all sounds and trigger onUserMovement to set filters/pans etc
		for (var i=0; i < arrSounds.length; i++) {
			arrSounds[i].playSound();
			arrSounds[i].onUserMovement(null, panorama);
		}
	};

	this.showUserData = function(e, pano){

		$('#user-pos')
			.find('.user-lat').text(pano.getPosition().lat()).end()
			.find('.user-lng').text(pano.getPosition().lng()).end()
			.find('.user-heading').text(pano.getPov().heading).end()
			.find('.user-pitch').text(pano.getPov().pitch);
	};

	this.showMarkerData = function(e, gEvent, marker, data){
		
		var json = data;
		delete json["icon"];
		delete json["draggable"];
		json["lat"] = ''+gEvent.latLng.lat();
		json["lng"] = ''+gEvent.latLng.lng();
		
		var jsonStr = JSON.stringify(json, null, ' ');
		$('#marker-pos').find('.json-pre').html(jsonStr);
	};

	this.addDevModeMarkup = function(){

		var userPos = $('<div id="user-pos"></div>');
		userPos.append('<h2>User (you)</h2>').css({'margin':'1em 0 0.3em 0','border-bottom':'1px solid #181818','padding-bottom':'1em'});
		userPos.append('<table><tr><td>Lat</td><td class="user-lat"></td></tr><tr><td>Lng</td><td class="user-lng"></td></tr><tr><td>Heading</td><td class="user-heading"></td></tr><tr><td>Pitch</td><td class="user-pitch"></td></tr></table>');

		var markerPos = $('<div id="marker-pos" ></div>');
		markerPos.append('<h2>Marker <p style="font-weight: normal; font-size: .6em; max-width: 300px;">Drag a marker, then copy and paste the code below to your JSON data file</p></h2>').css({'margin':'1.7em 0 0.5em 0','border-bottom':'1px solid #181818','padding-bottom':'.4em'});
		markerPos.append('<pre class="json-pre"></pre>').css({'line-height':'1.3em'});

		var debugWrap = $('<div id="debug-wrap"></div>').append(userPos).append(markerPos).css({'position':'absolute','min-width':'350px','font-family':'sans-serif','font-size':'1em','top':'10px','right':'10px','padding':'1.4em 2em','background':'#fff'});
		$('body').append(debugWrap);
	};

	this.init();
}