const config = require('./config/envConfig');
const RootServer = require('./RootServer');
const mongoose = require('mongoose');

const server = new RootServer(config.PORT);
server.init();


mongoose.connect('mongodb://karma:coldcold@db:27017/kkhcfiles?authSource=admin');

const Cat = mongoose.model('Cat', { name: String });

const kitty = new Cat({ name: 'Zildjian' });
kitty.save().then(() => console.log('meow'));