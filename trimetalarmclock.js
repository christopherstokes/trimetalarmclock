#!/usr/bin/env node

var shell = require('shelljs'),
	request = require("request")

var commandArgs = process.argv.slice(2),
	locID = commandArgs[0],
	route = commandArgs[1],
	timer = commandArgs[2],
	url = "http://developer.trimet.org/ws/V1/arrivals/locIDs/" + locID + "/json/true/appID/DB5E625704571597E22E37191",
	trains = {
		"blue": 100,
		"green": 200,
		"red": 90,
		"yellow": 190,
		"wes": 203,
		"ns": 193,
		"cl": 194
	},
	trainKeys = ["blue", "green", "red", "yellow", "wes", "ns", "cl"]

function checkBus() {
	request({
		url: url,
		json: true
	}, function(error, response, body) {

		if (!error && response.statusCode === 200) {
			var resultsData = body.resultSet; // Print the json response
			var currentTime = new Date(resultsData.queryTime);
			var timeUntil,
				busOrTrain

			function checkTime(currentTime, arrivalTime) {
				return (arrivalTime / 1000 - currentTime / 1000) / 60;
			}

			function checkTrain(oldRoute) {
				if (trains.hasOwnProperty(oldRoute)) {
					route = trains[oldRoute];
				}
			}

			function getTrain(oldRoute) {
				for (var i = 0; i < trainKeys.length; i++) {
					if (oldRoute == trains[trainKeys[i]]) {
						busOrTrain = " (train)";
						return trainKeys[i];
					}
				}
				busOrTrain = " (bus)";
			}


			for (var i = 0; i < resultsData.arrival.length; i++) {
				var checkThatTime = Math.floor(checkTime(currentTime, new Date(resultsData.arrival[i].estimated || resultsData.arrival[i].scheduled))),
					getThatTrain = resultsData.arrival[i].shortSign;
				checkTrain(route);
				if (route == null || '') {
					console.log(getThatTrain + " -- " + checkThatTime + " minutes");
					clearInterval(alarmLoop);
				} else if (resultsData.arrival[i].route == route || getTrain(route) == route) {
					if (timer == null || '') {
						console.log(getThatTrain + " -- " + checkThatTime + " minutes");
						clearInterval(alarmLoop);
					} else {
						if (resultsData.arrival[i].status == "estimated") {
							timeUntil = Math.floor(checkTime(currentTime, new Date(resultsData.arrival[i].estimated)));
							if (timeUntil <= timer) {
								console.log("You have " + timeUntil + " minutes to make the " + getThatTrain + busOrTrain);
								shell.exec('aplay bell.wav');
							} else {
								console.log("...");
							}
						} else {
							timeUntil = Math.floor(checkTime(currentTime, new Date(resultsData.arrival[i].scheduled)));
							if (timeUntil <= timer) {
								console.log("You have " + timeUntil + " minutes to make the " + getThatTrain + busOrTrain);
								shell.exec('aplay bell.wav');

							} else {
								console.log("...");
							}


						}
					}
				}
			}
		}
	})
}

checkBus();
var alarmLoop = setInterval(checkBus, 30000);
