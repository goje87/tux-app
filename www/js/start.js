/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 function log(message) {
     console.log(''+this, message);
 }

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('serverstarted', this.injectIframe, false);
        document.addEventListener('servererror', this.onError, false);
        window.addEventListener('message', this.onMessage.bind(this), false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        server.start();

        var sensors = cordova.plugins.BSMotionSensorsPlugin;
        sensors.getList(log.bind('success'), log.bind('error'));
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    injectIframe: function(ev) {
      var wrapper = document.querySelector('.mainframe-wrapper'),
          mainframe = document.createElement('iframe');

      mainframe.src = 'http://localhost:'+server.port; //ev.detail.url;
      mainframe.classList.add('mainframe');
      wrapper.appendChild(mainframe);
    },

    onMessage: function(ev) {
      var message = ev.data;
      ({
        'sensors-start': sensors.start,
        'sensors-stop': sensors.stop
      })[message]();
    }
};

var server = (function(G) {
  var httpd = null,
      base = '',
      config = {
        www_root: '',
        port: 8080,
        localhost_only: false
      };

  function successStartingServer(url) {
    base = url;
    var event = new CustomEvent('serverstarted', {
        detail: {
        url: url
      }
    });
    document.dispatchEvent(event);
  }

  function errorStartServer(err) {
    var event = new CustomEvent('servererror', {
      detail: {
        error: err
      }
    });
  }

  return {
    port: config.port,

    start: function(callback) {
      try {
        httpd = cordova.plugins.CorHttpd;
        if(!httpd) throw "CorHttpd Plugin not present";

        httpd.getURL(function(url) {
          // if url is an empty string, means server hasn't started
          if(!url.length) {
            httpd.startServer(config, successStartingServer, errorStartServer);
          }
        });
      }
      catch(err) {
        console.error(err);
        alert(err);
      }
    }
  }
})(this);

var sensors = (function(G) {
  var geolocationWatch = null,
      geoPosition = null,
      isRecording = false;

  function gotReading(reading) {
    // TODO: mainframe should not be referenced here
    var mainframe = document.querySelector('.mainframe'),
        mainframeWin = mainframe.contentWindow || mainframe,
        geo = geoPosition || {},
        acc = reading.acceleration,
        timestamp = reading.timestamp;

    mainframeWin.postMessage({
      type: 'sensors-reading',
      data: {
        version: 1,
        timestamp: timestamp,
        acceleration: { x: acc.x, y: acc.y, z: acc.z},
        position: {
          latitude: geo.latitude,
          longitude: geo.longitude,
          accuracy: geo.accuracy,
          heading: geo.heading,
          speed: geo.speed,
          altitude: geo.altitude,
          altitudeAccuracy: geo.altitudeAccuracy
        }
      }
    }, '*');
  }

  function gotPosition(pos) {
    geoPosition = pos.coords;
  }

  function gotError(err) {
    console.error(err);
    stop();
  }

  function start() {
    if(isRecording) return;

    cordova.plugins.BSMotionSensorsPlugin.start(gotReading, gotError);
    geolocationWatch = G.navigator.geolocation.watchPosition(gotPosition, gotError, {
      enableHighAccuracy: true,
      maximumAge: 3000
    });

    isRecording = true;
  }

  function stop() {
    if(!isRecording) return;

    cordova.plugins.BSMotionSensorsPlugin.stop();
    navigator.geolocation.clearWatch(geolocationWatch);

    geoPosition = null;
    isRecording = false;
  }



  return {
    start: start,
    stop: stop
  }
})(this);
