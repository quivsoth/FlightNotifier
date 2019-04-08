# Gets flight data from flightstats.com and broadcasts to a google home device

## This application has 3 core functions
1. Uses an express.js app to serve a simple html page to track in real time changes being made in MongoDB - Mongo DB must be run with replicasets
1. Broadcasts messages to a google home device
1. Tracks Flight data from flightstats.com

All 3 interfact with each other to create a solution that will alert the user of when something changes on a flight.

## Pre-requisites
1. Mongo Replicasets need to be set up - adjust connection string to your local configuration
1. Install cast-web-api by Tobias (Vervallsweg) @ https://vervallsweg.github.io/ 
1. A google home device or google.tts (i use a google home)
1. forever.js or supervisor.js used to keep server alive

## Tested with
* Mongo 4.0.6
* Node Version 10.9
* Mocha 6.0.2
* Google Chrome

## Installation
1. Run 3 Replication sets of MongoDB
* mongod --port 27017 --dbpath ./srv/mongodb/rs0-0 --smallfiles --replSet rs0
* mongod --port 27018 --dbpath ./srv/mongodb/rs0-1 --smallfiles --replSet rs0
* mongod --port 27019 --dbpath ./srv/mongodb/rs0-2 --smallfiles --replSet rs0

1. Run the google cast controller you should see (cast-web-api v1.0.2)
**cast-web-api --hostname=192.168.1.2 --port=3000**

1. Run the Flights web server
**node server**

1. Run flight tracker
**node ./listeners/trackFlightlistener.js**

1. rename config.backup to config.json with your configuration changes

## Options
To drop the database
> node server drop

To Rebuild the database
> node server build
