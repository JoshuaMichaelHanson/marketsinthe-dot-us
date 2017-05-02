



var map;  //global map object
var googleInfoWindow = null;//yes
var allLatLng = [];
var bounds;
var marketMap = new JoshMap("map.js");

$(document).ready(function () {
  var usdaUrl = "";//yes
  bounds = new google.maps.LatLngBounds();

  //alert("map");
  $('#btnGeo').button();
  //$('#zipcode').button().addClass('ui-textfield');
  //added some cool icons for inputs

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (success, err) {

      if (err !== undefined) {
        console.warn('Error(' + err.code + '): ' + err.message);
      }
      else {
        console.log(success);
        usdaUrl = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + success.coords.latitude + "&lng=" + success.coords.longitude;
        console.log(usdaUrl);
        //refresh map
        refreshMap(usdaUrl);
      }

    });//end callback
  }
  else {
    alert('No Geolocation suport!');
  }

  var mapOptions = {
    center: new google.maps.LatLng(37.09024, -100.712891),
    zoom: 5,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    panControl: false,
    panControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false,
    gestureHandling: 'greedy'
  };//end map options

  googleInfoWindow = new google.maps.InfoWindow({
    content: "placeholder"
  });

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  $('#zipcode').change(function () {
    usdaUrl = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + $('#zipcode').val();
    //refresh map here
    console.log(usdaUrl);
    refreshMap(usdaUrl);
  });//end .change
  
  $('#zipcode').on('keyup', function (e) {
    if (e.keyCode == 13) {
      usdaUrl = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + $('#zipcode').val();
      //refresh map here
      console.log(usdaUrl);
      refreshMap(usdaUrl);
    }
  });//end .change


  $('#btnGeo').click(function () {
    navigator.geolocation.getCurrentPosition(function (success, err) {

      if (err !== undefined) {
        console.warn('Error(' + err.code + '): ' + err.message);
      }
      else {
        $('#zipcode').val('');//reset zipcode input
        console.log(success);
        usdaUrl = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + success.coords.latitude + "&lng=" + success.coords.longitude;
        console.log(usdaUrl);
        //refresh map
        refreshMap(usdaUrl);
      }

    });//end callback
  });//end .click

});//end ready function
/* ****************************************************************************
This function makes the ajax call an updates the map
**************************************************************************** */
function refreshMap(usdaUrl) {
  //alert(usdaUrl);
  var marketIds = [];
  var marketNames = [];
  var allMarkers = [];
  var position;
  var tempMarketArray = [];

  $.ajax({
    type: "GET",
    contentType: "application/json; charset=utf-8",
    url: usdaUrl,
    dataType: 'jsonp',
    success: function (data) {

      $.each(data.results, function (i, val) {
        marketIds.push(val.id);
        marketNames.push(val.marketname);
      });//end data.results .each

      console.log(marketIds);
      console.log(marketNames);

      var counter = 0;
      var keyCount = 0;
      $.each(marketIds, function (k, v) {
        $.ajax({
          type: "GET",
          contentType: "application/json; charset=utf-8",
          url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + v,
          dataType: 'jsonp',
          success: function (data) {


            for (var key in data) {
              //debugger;
              console.log("Key", keyCount);
              keyCount++;
              console.log(key);
              console.log("k", k, "v", v);

              var thisResults = data[key];

              console.log(thisResults);

              var gLink = thisResults.GoogleLink;
              var latLong = decodeURIComponent(gLink.substring(gLink.indexOf("=") + 1, gLink.lastIndexOf("(")));

              //split the lat and long up
              var both = latLong.split(',');//array with lat and long
              var latitude = both[0];
              console.log("lat ", latitude);
              var longitude = both[1];
              console.log("long ", longitude);
              myLatLng = new google.maps.LatLng(latitude, longitude);
              console.log(myLatLng);
              allLatLng.push(myLatLng);

              allMarkers = new google.maps.Marker({
                position: myLatLng,
                map: map,
                title: marketNames[k],
                html:
                '<div class="markerPop">' +
                '<h2>' + marketNames[k].substring(4) + '</h2>' + //no distance
                '<h3>' + thisResults.Address + '</h3>' +
                '<p>' + thisResults.Products.split(';') + '</p>' +
                thisResults.Schedule +
                '</div>',
                marketId: marketIds[k]
              });//end new marker

              //build up a JSON object to store when the user adds
              //a market to their favorites
              var vendors = [];
              marketJson = {
                name: marketNames[k].substring(4),
                address: thisResults.Address,
                products: thisResults.Products.split(';'),
                schedule: thisResults.Schedule,
                latitude: latitude,
                longitude: longitude,
                googleLink: gLink,
                vendors: vendors
              };
              marketMap.put(marketIds[k], marketJson);

              counter++;
            }//end for loop

            //old spot for cut
            google.maps.event.addListener(allMarkers, 'click', function () {
              //alert(this);
              innerThis = this;
              console.log(this);
              $(this.html).dialog({
                width: 'auto',
                maxWidth: 600,
                height: 'auto',
                title: this.title,
                close: function (event, ui) {
                  $(this).dialog('destroy').remove();
                  window.scrollTo(0, 0);
                },
                modal: true,
                fluid: true,
                buttons: {
                  "Close": function () {
                    $(this).dialog("destroy").remove();
                    window.scrollTo(0, 0);
                  },
                  "Favorites": function () {
                    //alert(JSON.stringify(marketMap.get([innerThis.marketId])));
                    addToFavorites(innerThis.marketId);
                    $(this).dialog("destroy").remove();
                    window.scrollTo(0, 0);
                  }
                }
                /*
                position: {
                    my: 'left top',
                    at: 'left bottom',
                    of: 'menu'
                } 
                */
              });
              //googleInfoWindow.setContent(this.html);
              //googleInfoWindow.open(map, this);
            });//end listener

            for (var i = 0, LtLgLen = allLatLng.length; i < LtLgLen; i++) {
              console.log("Extending..");
              bounds.extend(allLatLng[i]);
            }

            //map.setCenter(allLatLng[0]);
            map.fitBounds(bounds);

          }//end inner success

        });//end inner ajax
      });//end marketIds .each

    }//end success
  });//end ajax
}
/* ****************************************************
Add the market to the users favorites if does not exist
Else ignores.  Dont want to overwrite their added values
**************************************************** */
function addToFavorites(marketId) {
  if (window.localStorage.getItem("mid" + marketId) === null) {
    //doesnt exist
    var newJson = JSON.stringify(marketMap.get(marketId));
    window.localStorage.setItem("mid" + marketId, newJson);
    //add to the order
    if (window.localStorage.getItem("midOrder") !== null) {
      orderedKeys = window.localStorage.getItem("midOrder");
      orderedKeys = JSON.parse(orderedKeys);
      console.log(orderedKeys);
      orderedKeys.push("mid" + marketId);
      orderedKeys = JSON.stringify(orderedKeys);
      window.localStorage.setItem("midOrder", orderedKeys);
    }
  }
}