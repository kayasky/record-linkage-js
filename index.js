(function() {
  var fs = require('fs'),
    listingsArr = require('./data/listings').listings,
    productsArr = require('./data/products').products,
    useMocks = false,
    showLog = true,
    results = [],
    resultsTxt = "",
    currentProductModel,
    listings = useMocks ? [{
      "title": "Sony DSC-W310 12.1MP Digital Camera with 4x Wide Angle Zoom with Digital Steady Shot Image Stabilization and 2.7 inch LCD (Silver)",
      "manufacturer": "Sony",
      "currency": "CAD",
      "price": "139.99"
    }] :
    listingsArr,
    products = useMocks ? [{
      "product_name": "Sony_Cyber-shot_DSC-W310",
      "manufacturer": "Sony",
      "model": "DSC-W310",
      "family": "Cyber-shot",
      "announced-date": "2010-01-06T19:00:00.000-05:00"
    }] :
    productsArr;

  function splitWords(phrase) {
    phrase = phrase || '';
    var lowerCased = phrase.toLowerCase();
    return lowerCased.split(/[\s_-]+/);
  }

  function scoreListing(product, listing) {
    var matches = {
      name: 0,
      manufacturer: 0,
      model: 0,
      family: 0,
      score: 0,
      product: product
    };

    var _product = {
      "name": splitWords(product.product_name),
      "manufacturer": splitWords(product.manufacturer),
      "model": splitWords(product.model),
      "family": splitWords(product.family)
    };

    var _listing = {
      "manufacturer": splitWords(listing.manufacturer),
      "title": splitWords(listing.title)
    };

    _product.name.forEach(function(word) {
      if (_listing.title.indexOf(word) > -1) {
        matches.name++;
      }
    });

    // _product.model.forEach(function(word) {
    //   if (_listing.title.indexOf(word) > -1) {
    //     matches.model++;
    //   } else if (_listing.title.indexOf(splitWords(product.model).join('')) > -1) {
    //     matches.model++;
    //   }
    // });

    _product.family.forEach(function(word) {
      if (_listing.title.indexOf(word) > -1) {
        matches.family++;
      }
    });

    _product.manufacturer.forEach(function(word) {
      if (_listing.manufacturer.indexOf(word) > -1) {
        matches.manufacturer++;
      }
    });

    if (matches.name && matches.manufacturer && matches.family) {
      matches.score = matches.name + matches.manufacturer + matches.model + matches.family;
    }
    return matches;
  }

  function filterListings(listing) {
    // Is the product model in the listing title?
    var _listing = splitWords(listing.title);
    var _model = splitWords(currentProductModel);
    var occurances = 0;

    _model.forEach(function(word) {
      if (_listing.indexOf(word) > -1) {
        occurances++;
      } else if (_listing.indexOf(splitWords(currentProductModel).join('')) > -1) {
        occurances++;
      }
    });

    if (occurances >= _model.length) {
      return true; //hey
    }
    return false;
  }

  function findAndWriteMatches(products, listings) {
    var file = fs.createWriteStream('results.txt'),
      filteredListings = [],
      matchedListings = [],
      result,
      matched;

    file.on('error', function(err) {
      console.log(err);
    });

    products.forEach(function(product) {
      matchedListings = [];
      currentProductModel = product.model;

      filteredListings = listings.filter(filterListings);

      filteredListings.forEach(function(listing) {
        matched = scoreListing(product, listing);
        if (matched.score > 0) {
          matchedListings.push(listing);
        }
      });

      result = {
        "product_name": product.product_name,
        "listings": matchedListings
      };

      results.push(result);

      file.write(JSON.stringify(result) + '\n');

      console.log('Found ' + matchedListings.length.toString() + ' listings for ' + product.product_name);

    });
    file.end();
  }

  findAndWriteMatches(products, listings);

})();
