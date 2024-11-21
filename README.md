1)  NodeJS ChirpStack Application HTTP Integration to SWARM Serial USB Middleware
    middleware.js

SWARM was an IoT satellite service that allowed the sending of 192 byte ASCII messages with the utilization of the SWARM Development kit.  The SWARM development kit was made up of the M138 satellite modem, FeatherS2 microdevice, and solar power kit.

![image](https://github.com/user-attachments/assets/32ea58e9-62ab-4c55-84d5-16a6983466d9)

The purpose of this “middleware” was to provide glue between Chirpstack HTTP Integration and the SWARM Development kit. This middleware listened on localhost port 88 for incoming connections from Chirpstack.  Chirpstack executed an HTTP POST to the middleware with a payload containing data from weather station.  Middleware stripped out relevant data and created a command in proper format to send to M138 modem in SWARM development kit.  Command was then sent to SWARM modem via USB Serial connection.  The payload of the message sent to the modem had a capacity of 192 bytes, or 192 ASCII characters.  The modem had the ability to queue 1024 messages.  There were only a handful of communication windows for the SWARM development kit to send messages to the satellites every day.  This led to most messages waiting in the modem queue for hours before being sent.  Once sent, messages floated amongst the satellites for hours before being available for download from the SWARM HIVE API.
