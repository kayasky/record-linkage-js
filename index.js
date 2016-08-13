(function(exports) {
  'use strict';

  var fs = require('fs'),
    showLog = true, // Set this to true to show logs while matches are being made
    results = [],
    resultsTxt = "",
    currentProductModel;

  // Returns an array containing all the words in the phrase passed
  function splitWords(phrase) {
    phrase = phrase || '';
    var lowerCased = phrase.toLowerCase();
    return lowerCased.split(/[\s_-]+/);
  }

  // Returns a score based on how close the listing is the passed product
  function scoreListing(product, listing) {
    var matches = {
      name: 0,
      manufacturer: 0,
      model: 0,
      family: 0,
      score: 0
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
    return matches.score;
  }

  // Returns true if the passed listing contains the currentProductModel in it's title
  function preFilterListings(listing) {
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

    return occurances >= _model.length;
  }

  // Iterates through the products array and finds any matching listings from the listings array
  // and writes the results to the results.txt file
  function findAndWriteToFile(products, listings) {
    var file = fs.createWriteStream('results.txt'),
      filteredListings = [],
      matchedListings = [],
      result,
      matchScore;

    file.on('error', function(err) {
      console.log(err);
    });

    products.forEach(function(product) {
      matchedListings = [];
      currentProductModel = product.model;

      filteredListings = listings.filter(preFilterListings);

      filteredListings.forEach(function(listing) {
        matchScore = scoreListing(product, listing);
        if (matchScore > 0) {
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

  exports.link = function(products, listings) {
    if (!products || !listings) throw 'Error: products and listings should be of type array';
    return findAndWriteToFile(products, listings);
  };

})(typeof exports !== "undefined" ? exports : this);
