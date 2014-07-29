# Sounds of Street View Framework

###A JavaScript library to add sound to a Google Street View experience.

Watch the promotional video for an explanation and overview of what can be achieved 
with the Sounds of Street View Framework.

[![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/vimeo-img.jpg)](https://vimeo.com/101599212)

Explore three environments created by Amplifon on [the official Sounds of Street View website](http://www.amplifon.co.uk/sounds-of-street-view/).

## Dependencies

- [Google Maps API v3](https://developers.google.com/maps/documentation/javascript/basics)
- [JQuery](http://jquery.com/)
- [Howler - (epiphanysearch fork)](https://github.com/epiphanysearch/howler.js)

## How to use it

The following explanations are specifically written for those with only a 
rudimentary understanding of HTML and JavaScript. If you are a developer, or 
are confident that you have a decent understanding of these technologies, then 
head straight over to the src folder, and look at the demo HTML file where everything should 
be fairly self explanatory.

### Include the dependencies

The first thing to do is to include the 3 JavaScript dependencies within the head section 
of your HTML page. Make sure that the version of Howler.js you include is the specific 
epiphanysearch fork version as this contains extra code to support the 
use of Web Audio API Low Pass Filters. Using this filter ensures that sounds become brighter 
when positioned in front of the user. You can also find a minified version of the epiphanysearch 
Howler.js in the js/vendor folder of this repo.

```html
    <!-- Load the Google Maps API -->
    <script src="//maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
    
    <!-- Load jQuery -->
    <script src="//code.jquery.com/jquery-2.1.1.min.js"></script>

    <!-- Load the epiphanysearch fork of Howler.js -->
    <script src="js/vendor/howler.min.js"></script>
```

### Create an element on your page for the Google Street View instance

Make sure when you create this HTML element that it has a unique ID, and that 
the ID you provide it with matches the ID that you stipulate within your JSON data 
file (see below)

```html
	<div id="pano"></div>
```

### Create your JSON data file

The JSON file should contain all the data for your Sounds of Street View application, including 
the start position of the map when the application loads, as well as the positioning and volume 
levels for all of your sounds. The "id" property at the start of the file should exactly match the 
unique ID that you gave the HTML element within your HTML (see above).

This is the demo JSON file included within the src demo as part of this repo.

```json
	{
	    "id": "pano",

	    "lat": "43.950649",
	    "lng": "4.806588",
	    "heading": "60",
	    "pitch": "1",
	    
	    "sounds": [
	        {
	            "name": "accordion",
	            "lat": "43.950648973687",
	            "lng": "4.806433016568121",
	            "src": [
	                "audio/accordian.mp3"
	            ],
	            "db": "80",
	            "pause": "0"
	        },
	        {
	            "name": "church-bell-2",
	            "lat": "43.951337460699705",
	            "lng": "4.8069440499275515",
	            "src": [
	                "audio/church-bell.mp3"
	            ],
	            "db": "100",
	            "pause": "0"
	        }

	        ... add more sound objects here ...
	    ]
	}
```
#### JSON Properties

Here is a more thorough breakdown of the properties included within the JSON data file;

**id**  
This should match the ID of your HTML element where the Google Street View will appear  

**lat**  
This is the latitude position value where your application will start upon load   

**lng**  
This is the longitude position value where your application will start upon load  

![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/git-img-3.jpg)

**heading**  
This is the heading position value where your application will start upon load (ie. which direction the user is facing)   

**pitch**  
This is the pitch position value where your application will start upon load (ie. how low or high the user is facing)   

**sounds**  
This is an array of sound objects (denoted by the square brackets) that will be positioned within your application. 
The Framework does not impose any limits upon how many sounds you can add, however be aware that any computer viewing 
your app *will* have limitations for how many current sounds it can track and play depending upon the processing 
power of the machine. 

#### Individual sound properties

Each sound has the following properties;

**name**  
Although the user will not see this name, it can be useful when building your application as 
the name of each sound object will appear on hover (as shown below) when you view your application in dev mode. 
You can trigger dev mode by appending ?dev=true to the end of your application URL.

![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/git-img-1.jpg
)

**lat**  
This is the latitude position where your sound will be positioned on your Street View map  

**lng**  
This is the longitude position where your sound will be positioned on your Street View map  

**src**  
The path to the mp3 file associated with the sound object

**db**  
The "loudness" of the sound, ie how far away it can be heard from. Although db suggests 
that this is the decibel level for a sound it is not calculated at decibel levels. The db property 
should be a value between 1 and 100, with 1 being very quiet and 100 being very loud.

**pause**  
The length of time to wait between each loop of the sound. This is a length of time in 
milliseconds so a 1 second pause between each loop would have a pause value of 1000.

#### Guide to placing sounds

By adding **"?dev=true"** to the end of your URL, you will be able to see the markers which are normally invisible in your application. To start, once you have a street view location, give a sound the same **lat** and **long** values as this location, then find it by walking away from your start position.

You can then drag any marker around and place it where the sound is being emitted from. The JSON code to insert for this sound will update in the panel, ready to copy and paste into your file. It's important to get positioning accurate so that a sound is heard from the correct source - so walk around the marker, as near as possible and keep dragging and dropping till it seems as close as possible. In the best scenario, walk 'on' the sound source and drag the marker to your feet.

![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/git-img-5.gif)

#### Debugging your JSON file

If you are unfamiliar with writing JSON then it can be frustrating as a simple comma in the wrong 
place, or a missing quotation mark can break your application (hint shown in image below). You can use an online JSON linting 
tool to find and remove any errors you may have in your data.

![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/git-img-2.jpg)

- [JSONLint](http://jsonlint.com/)

### Creating your sounds

Creating your sounds can be done in a number of ways. You can either create them yourself, or purchase them from audio sample websites (such as http://audiojungle.net). For a free and easy program to create from scratch or alter sounds, download Audacity at http://audacity.sourceforge.net/download/. 

When exporting your MP3s from Audacity (or other software of your choice), export at as low quality as possible so that your application loads as quickly as possible. Because you will create a range of different sounds, small quality intricacies aren't as noticeable as normal. We recommend 64kbps as shown below.

![ScreenShot](https://raw.githubusercontent.com/Amplifon/Sounds-of-Street-View-Framework/master/src/img/git-img-4.jpg)


## Run your application

In order to get your application to run the last thing you need to do is to create a new 
SOSV object in your custom JavaScript. As the project is using jQuery as a dependency the easiest way 
is to do it on the jQuery DOM ready. Make sure that the path to your JSON file is correct!

```javascript
	<script>
        $(function(){
            new SOSV('data/demo.json');
        });
    </script>
```

## License

The MIT License

Copyright (c) 2014 Amplifon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
