const nsync = new (require('./nsync'))('127.0.0.1', '6666', { server: true });

nsync.start();
