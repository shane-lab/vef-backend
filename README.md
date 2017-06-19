# Backend | VEF - Video Embedded Feedback

[![npm version](https://img.shields.io/badge/node%20version-~4.4.7-brightgreen.svg)](https://nodejs.org/en/download/)
![express version](https://img.shields.io/badge/express-~4.13.4-brightgreen.svg)

### About

This is the backend of the project. The server is served on in this app

### Setup

#### Prerequisites
Install [mongodb](https://mongodb.com/), follow the instructions for your OS.
Install [node](https://nodejs.org/en/download/).

The API documentation uses apiDoc to auto-generate documentation for all routes
```sh
# clone project
$ cd ./backend
# Working with apiDoc [optional]
$ sudo npm install -g apidoc
```

After installing the prerequisites, install all the dependencies: 
```sh
$ npm install
# Working with apiDoc [optional]
$ apidoc -i ./apidoc -o ./doc
# clone any fork of apiDoc template into ./apidoc/templates/
$ git clone https://github.com/shvelo/apidoc-bs3-template.git ./apidoc/templates/shvelo
# OR 
$ git clone https://github.com/interledger/apidoc-template.git ./apidoc/templates/interledger/template
# OR fork your own and run the apiDoc command with the template flag
$ apidoc -i ./apidoc -o ./doc -t ./apidoc/templates/[template]/template/
```

#### Running app
When all prerequisites are installed, the app can be run using the following
```sh
# run mongo
$ mongod && mongo localhost:27017/vefdb
# serves the app on port 3000
$ node app
# OR with custom port
$ PORT=9999 node app
```

visit ://127.0.0.1:PORT/