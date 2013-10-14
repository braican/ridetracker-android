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
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        RT.init();
        RT.addListeners();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

// jqtouch
var jqt = new $.jQTouch({
    addGlossToIcon: false,
    startupScreen:  null,
    useTouchScroll: false,
    preloadImages:  []
});


(function(RT, $, undefined){

    // the remote server where all the remote database stuff happens
    var remoteServer = 'http://192.168.254.170/braican/ridetracker/website/app/';

    // get all of the rides
    function getTheRides(id){
        $('#ride-list .ride-row-container').empty();
        $.getJSON(remoteServer + 'ridetracker.php?rideID=' + id, function(json, textStatus) {
            if(textStatus != 'success'){
                console.log("ERROR");
                console.log(textStatus);
            } else{
                if(json.status || json.status == 0){
                    $('#ride-list .ride-row-container').html("No rides");
                    $('#ride .title-bar').append("<div>there was an error</div>");
                } else {
                	$('#ride .title-bar h1').text(json.name);

                    $.each(json.rides, function(index, val) {
                        var newRide =   '<div class="clearfix ride">' +
                                            '<div class="date">' + val.date + '</div>' +
                                            '<div class="time">' + outputTime(val.secs) + '</div>' +
                                            '<div class="to-from ' + val.to_from_class + '">' + val.to_from + '</div>' +
                                        '</div>';
                        $('#ride-list .ride-row-container').append(newRide);
                    });

                    // overall stats
                    $('#ride-list .overall .count').text(json.rides.length);
                    $('#ride-list .overall .best-time').html(outputTime(json.all_min));
                    $('#ride-list .overall .worst-time').html(outputTime(json.all_max));
                    $('#ride-list .overall .avg-time').html(outputTime(json.all_avg));

                    // to stats
                    $('#ride-list .to .count').text(json.to_count);
                    $('#ride-list .to .best-time').html(outputTime(json.to_min));
                    $('#ride-list .to .worst-time').html(outputTime(json.to_max));
                    $('#ride-list .to .avg-time').html(outputTime(json.to_avg));

                    // from stats
                    $('#ride-list .from .count').text(json.from_count);
                    $('#ride-list .from .best-time').html(outputTime(json.from_min));
                    $('#ride-list .from .worst-time').html(outputTime(json.from_max));
                    $('#ride-list .from .avg-time').html(outputTime(json.from_avg));

                }
            }
        }); 
    }

    function getTheRoutes(){
        $('#route-list').empty();
        $.getJSON(remoteServer + 'ridetracker.php?listRoutes', function(json, textStatus) {
            if(textStatus != 'success'){
                console.log(textStatus);
            } else{
                if(json.status || json.status == 0){
                    $('#route-list').html("No routes");
                } else {
                    $.each(json, function(routeID, routeData){
                        var newRoute =  '<div class="clearfix route">' + 
                                            '<a href="#ride" data-id="' + routeID + '">' +
                                                routeData['name'] +
                                                '<span>' + routeData['miles'] + '</span>' + 
                                            '</a>' +
                                        '</div>';
                        $('#route-list').append(newRoute);
                    });
                }
            }
        });
    }

    // format the time into hrs:mins:secs
    function outputTime(secs){
        var mins = leadZeros(Math.floor((secs % 3600) / 60)),
            hrs = leadZeros(Math.floor(secs / 3600)),
            secs = leadZeros(Math.round((secs % 3600) % 60));

        return '<span class="the-time">' + hrs + ':' + mins + ':' + secs + '</span>';
    }

    function leadZeros(t){
        return t < 10 ? '0' + t : t;
    }

    // -------------------------------
    // initialize the things
    //
    RT.init = function(){
        getTheRoutes();
    };

    // -------------------------------
    // add event listeners
    //
    RT.addListeners = function(){
        $(document).on('click', '#route-list a', function(event){
            event.preventDefault();
            var id = this.getAttribute('data-id');
            getTheRides(id);
            $('input[name="route_id"]').val(id);
        });

        $('form').submit(function(event){
            event.preventDefault();
            var $this = $(this);
            var id = $this.find('input[name="route_id"]').val();
            
            $.post(remoteServer + 'submit.php?' + $this.attr('data-submit'), $this.serialize(), function(data, textStatus, xhr) {
                console.log(data);
                $this.find('input[type=number]').val('');
                $this.find('input[type=radio]').removeAttr('checked');
                if($this.attr('id') == 'addroute'){
                    $('#home .ajax-message').text(data);    
                    getTheRoutes();
                } else {
                    getTheRides(id);
                }
            });
        });
    };

})(window.RT = window.RT || {}, Zepto);

