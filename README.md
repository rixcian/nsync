# 🚀 nsync

**nsync** is library for synchronizing your files to remote server built just with Node.js API, so it's zero-dependency library.

**nsync** implements own TCP protocol for file transfer because firstly I wanted to just play with the Node.js Socket API and secondly I wanted to use some lightweight protocol, so why not to implement my own.


<br />


## 🔍 Content

- [📑 Documentation](#Documentation)
- [📝 Todo](#Todo) 


<br />


## 📑 Documentation

### Basic usage
This example shows how to run basic server and client that sends single file to the server.

#### Server (server.js)
```javascript
const nsync = new (require('./nsync'))('127.0.0.1', '6666', { server: true });

nsync.start();
```

#### Client (client.js)
```javascript
const nsync = new (require('./nsync'))('127.0.0.1', '6666', { server: false });

nsync.connect()
  .then(() => {
    
    nsync.sendFile(`${__dirname}/data/text_sample.txt`)
      .then(() => {
        nsync.disconnect();
      });
  
  });
```


<br />


## 📝 Todo

- <input type="checkbox" checked> Add upload of single file (finished)
<br />
- <input type="checkbox"> Add option for uploading whole directory
<br />
- <input type="checkbox"> Add unit tests for the library
<br />
- <input type="checkbox"> Add option for reading server & client settings from configuration file
<br />
- <input type="checkbox"> Add support for auto-sync files
<br />
- <input type="checkbox"> Add support for SSL encryption
<br />
- <input type="checkbox"> Add support for Gzip compression
<br />
- <input type="checkbox"> Create Graphical Interface (GUI)
