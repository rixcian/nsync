const nsync = new (require('./nsync'))('127.0.0.1', '6666', { server: false });

nsync.connect()
  .then(() => {
    
    nsync.sendFile(`${__dirname}/data/text_sample.txt`)
      .then(() => {
        nsync.disconnect();
      });
  
  });