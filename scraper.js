const fs = require('fs');
const csv = require('csv');
const jsdom = require('jsdom'); // create a virtaul DOM to traverse
const { JSDOM } = jsdom; // constructor for jsdom

const scrapeIt = require('scrape-it');

// check if there is a data folder; if not, create one
function checkForDataFolder() {
    if (!(fs.existsSync('./data'))) {
        fs.mkdirSync('./data');
    }
}

// using the npm scrape-it module
// using the arguments passed to the scraper, the scraper returns
// the href attribute of all the <a> elements in <li>sts in the <ul> with a 
// class name of .products, in the format {shirts: [{url: url1}, {url: url2}, etc.]}
function scrapeSite() {
    scrapeIt('http://shirts4mike.com/shirts.php', {
            shirts: {
                listItem: ".products li a",
                data: {
                    url: {
                        attr: "href"
                    }
                }
            }
        }, // next follows a callback function for the scraper
        (error, data) => {
            if (error) {
                console.log('there was an error!');
            } else {
                console.log(data.data);
            }
        })
}

// INITIAL SETUP
checkForDataFolder();
scrapeSite();