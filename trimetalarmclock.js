#!/usr/bin/env node

var p = require('parsec');

var shell = require('shelljs'),
	request = require("request"),
	config = require('./config');

var commandArgs = process.argv.slice(2),
	locID = commandArgs[0],
	route = commandArgs[1],
	timer = commandArgs[2],
	url = "http://developer.trimet.org/ws/V1/arrivals/locIDs/" + locID + "/json/true/appID/" + config.trimet.appID,
	trains = {
		"blue": 100,
		"green": 200,
		"red": 90,
		"yellow": 190,
		"wes": 203,
		"ns": 193,
		"cl": 194
	},
	trainKeys = ["blue", "green", "red", "yellow", "wes", "ns", "cl"],
	waiting = '';

function processCommands() {
}

function checkBus() {
	process.stdout.write("\u001b[2J\u001b[0;0H");
	request({
		url: url,
		json: true
	}, function(error, response, body) {

		if (!error && response.statusCode === 200) {
			var resultsData = body.resultSet; // Print the json response
			var currentTime = new Date(resultsData.queryTime);
			var timeUntil;

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
						return trainKeys[i];
					}
				}
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
								console.log("You have " + timeUntil + " minutes to make the " + getThatTrain);
								shell.exec('aplay bell.wav');
							} else {
								console.log(waiting += "...");
								console.log("You still have " + timeUntil + " minutes to make the " + getThatTrain);
							}
						} else {
							timeUntil = Math.floor(checkTime(currentTime, new Date(resultsData.arrival[i].scheduled)));
							if (timeUntil <= timer) {
								console.log("You have " + timeUntil + " minutes to make the " + getThatTrain);
								shell.exec('aplay bell.wav');

							} else {
								console.log(waiting += "...");
								console.log("You still have " + timeUntil + " minutes to make the " + getThatTrain);
							}
						}
					}
				}
			}
		}
	})
}

processCommands();
checkBus();
var alarmLoop = setInterval(checkBus, 30000);
