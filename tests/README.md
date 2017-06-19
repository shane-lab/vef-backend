# Unit testing

### Setup

#### Prerequisites
Install [mongodb](https://mongodb.com/), follow the instructions for your OS.
Install [node](https://nodejs.org/en/download/), afterwards install mocha using the node packagemanager:
```sh
$ sudo npm install -g mocha
```

After installing the prerequisites, 
```sh
$ cd ..
$ npm install
# run mongo
$ mongod
# optional:
$ mongo http://127.0.0.1:27017/vef_test
# run unit test
$ mocha ./tests/
```