# Viztrack
A Visual track based genome browser with support for Linkage analysis and Gene phyologeny analysis.

Installation

Viztrack is written for deployment on a server using Nodejs however is completely based in HTML5/Javascript and has no module dependency and can therefore be deployed to any web server

To run on local machine (Linux/Windows):

1)Install Nodejs and NPM either through Linux command:

sudo apt install nodejs

Or by downloading the binary and following instructions to install

https://nodejs.org/en/download/

2)Download and unzip the entire Viztrack directory or clone to a local directory

3)Navigate to the Viztrack folder containing package.json and run command to install npm modules

npm install

4)Run Nodejs from command line and navigate to port 3000 from web browser

nodejs app.js

https://localhost:3000

*note-Viztrack is set to run on port 3000 but can be changed in app.js if that port is unavailable, if 3000 is not working then try port:1337

To run on an already available webserver:

1)Download and unzip the entire Viztrack directory or clone to a local directory

2)Link to /views/viztrack.html

3)Change viztrack.html javascript src and file locations to the absolute directory of /public/javascripts/... and /public/data/....

* For now, viztrack can only display data from the data folder, but will change in the future to upload or link to files on webserver or local machine. 