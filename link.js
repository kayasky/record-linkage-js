var listings = require('./data/listings').listings,
  products = require('./data/products').products,
  linkRecords = require('./index');

linkRecords.link(products, listings);
