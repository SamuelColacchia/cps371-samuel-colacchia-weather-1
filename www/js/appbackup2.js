var weatherApp = angular.module('weather', ['ionic']);
var googleGeoServiceLoaded = false;

weatherApp.constant('FORECASTIO_KEY', '22e4ef7a0bc69e27528e5691b907f9e6');

weatherApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

weatherApp.controller('weatherCtrl', function($scope, $ionicModal, weatherService, googleGeoService, $stateParams) {

  var arrayid = 0;

  $scope.cards = [];

  $ionicModal.fromTemplateUrl('new-card.html', function(modal) {
    $scope.cardModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $scope.createCard = function(card) {
    $scope.cards.push({
      cardID: arrayid,
      address: card.city,
      cTemp: 0
    });
    var currentCardID = arrayid;
    var address = card.city;
    $scope.cardModal.hide();
    card.city = "";

    if (googleGeoServiceLoaded === false) {
      googleGeoService.get().then(function(response) {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({
          'address': address
        }, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            console.log('Map', results[0]);
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();
            $scope.cards[currentCardID].map = results[0];
            getWeatherData(longitude, latitude, currentCardID);

          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }, function(error) {
        console.error('Error getting googleGeoApi');
      });
      googleGeoServiceLoaded = true;
    } else {
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'address': address
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          console.log('Map', results[0]);

          var latitude = results[0].geometry.location.lat();
          var longitude = results[0].geometry.location.lng();
          $scope.cards[currentCardID].map = results[0];
          getWeatherData(longitude, latitude, currentCardID);


        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });



    }



    console.log('Cards', $scope.cards);
    arrayid++;


  };

  function search(id) {
    for (var i = 0; i < $scope.cards.length; i++) {
      if ($scope.cards[i].cardID === id) {

        return i;
      }
    }
  }

  $scope.newCard = function() {
    $scope.cardModal.show();
  };

  $scope.closeNewCard = function() {
    $scope.cardModal.hide();
  };

  $scope.removeCard = function(id) {
    var pos = search(id);
    $scope.cards.splice(pos, 1);
    arrayid--;
  };

  // Below method accured from here http://stackoverflow.com/questions/16978331/from-unix-timestamp-to-datetime
  $scope.getTheDate = function(time) {
    var sDate = Date(time);
    return sDate;
  };

  function getWeatherData(longitude, latitude, currentCardID) {
    weatherService.get(longitude, latitude).then(function(response) {
      $scope.current = response.data;
      //  var pos = search(currentCardID);
      $scope.cards[currentCardID].data = $scope.current;
      console.log('Got Weather', $scope.current);

    }, function(error) {
      console.eror('Error getting weatherData');
    });
  }

});

weatherApp.service('googleGeoService', function($http) {
  var URL = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBoTwYsdxFpuvMGr44Ar2-Mm2pys-jfOhM&signed_in=true&callback=JSON_CALLBACK";

  this.get = function() {
    return $http.jsonp(URL);
  };

});

weatherApp.service('weatherService', function($http) {
  var key = "22e4ef7a0bc69e27528e5691b907f9e6";

  var URL = "https://api.forecast.io/forecast/" + key + "/";

  this.get = function(longitude, latitude) {
    var CURL = URL + latitude + "," + longitude + "?callback=JSON_CALLBACK";

    return $http.jsonp(CURL);
  };

});

//weatherApp.factory('weatherData', forecastioWeather);
