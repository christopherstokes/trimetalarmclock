# trimetalarmclock
sets an alarm to remind you about your bus

syntax:

	$./trimetalarmclock.js [stopID] [route] [timer]
	
	$ ./trimetalarmclock.js 11944
	96 To Portland -- 247 minutes
	38 To Portland -- 280 minutes
	76 To Beaverton TC -- 283 minutes

	$ ./trimetalarmclock.js 11944 96
	96 To Portland -- 246 minutes
	
	$ ./trimetalarmclock.js 11944 96 250
	You have 245 minutes to make the 96 To Portland (bus)
	Playing WAVE 'bell.wav' : Signed 16 bit Little Endian, Rate 44100 Hz, Stereo


end
