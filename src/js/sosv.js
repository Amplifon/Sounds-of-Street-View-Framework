
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

		obj.data.icon = (devMode) ? null : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
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
		json["lat"] = gEvent.latLng.lat();
		json["lng"] = gEvent.latLng.lng();
		
		var jsonStr = JSON.stringify(json, null, ' ');
		$('#marker-pos').find('.json-pre').html(jsonStr);
	};

	this.addDevModeMarkup = function(){

		var markerPos = $('<div id="marker-pos" ></div>');
		markerPos.append('<h2>Marker</h2>').css({'margin':'1em 0 0.3em 0','border-bottom':'1px solid #181818','padding-bottom':'.4em'});
		markerPos.append('<pre class="json-pre"></pre>').css({'line-height':'1.3em'});


		var userPos = $('<div id="user-pos"></div>');
		userPos.append('<h2>User</h2>').css({'margin':'1em 0 0.3em 0','border-bottom':'1px solid #181818','padding-bottom':'.4em'});
		userPos.append('<table><tr><td>Lat</td><td class="user-lat"></td></tr><tr><td>Lng</td><td class="user-lng"></td></tr><tr><td>Heading</td><td class="user-heading"></td></tr><tr><td>Pitch</td><td class="user-pitch"></td></tr></table>');

		var debugWrap = $('<div id="debug-wrap"></div>').append(userPos).append(markerPos).css({'position':'absolute','min-width':'350px','font-family':'sans-serif','font-size':'1em','top':'10px','right':'10px','padding':'1.4em 2em','background':'#fff'});
		$('body').append(debugWrap);
	};

	this.init();
}