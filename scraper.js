const fs = require('fs');
const csv = require('csv');
const jsdom = require('jsdom'); // create a virtaul DOM to traverse
const { JSDOM } = jsdom; // constructor for jsdom

const scrapeIt = require('scrape-it');

let infoForAllShirts = []; // holds all the objects with info associated with each shirt product page


// check if there is a data folder; if not, create one
function checkForDataFolder() {
    if (!(fs.existsSync('./data'))) {
        fs.mkdirSync('./data');
    }
}

// scrapes the webpage of an individual shirt for price etc.
// Scrape the product title, price, imageURL
// (the URL is already provided in the link argument passed to the function)
function scrapeIndividualShirt(link) {
    scrapeIt(link, {
            title: {
                listItem: ".shirt-details h1"
            },
            price: {
                listItem: ".shirt-details h1 span"
            },
            imageURL: {
                listItem: ".shirt-picture img",
                data: {
                    url: {
                        attr: "src"
                    }
                }
            }
        }, // next follows a callback function for the scraper
        (error, data) => {
            if (error) {
                console.log('there was an error!', error);
            } else {

                const result = data.data;

                // clean up the data and return as an object
                // the scrape-it module returns an array nested in an object
                // so a single element in the array has index 0
                // determine price
                const price = result.price[0];

                // first, the price needs to be removed from the title
                // following the price is a space, so remove that too
                const title = result.title[0].replace(price + ' ', '');

                // determine imageURL
                const imageURL = 'http://shirts4mike.com/' + result.imageURL[0].url;

                // date and time when scraped
                const date = new Date();

                infoForAllShirts.push({ title, price, imageURL, link, date });
            }

        });

}

// using the npm scrape-it module
// using the arguments passed to the scraper, the scraper returns
// the href attribute of all the <a> elements in <li>sts in the <ul> with a 
// class name of .products, in the format {shirts: [{url: url1}, {url: url2}, etc.]}
function scrapeSite() {
    let linksToIndividualShirts = [];
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
                console.log('there was an error!', error);
            } else {
                // console.log(data.data); // for debugging
                // traverse the data.data object to extract links to individual shirt
                // pages, and then assign to array
                //shirts[0][0].url
                for (let i = 0; i < data.data.shirts.length; i++) {
                    // the url returned does not include the domain name
                    // so add the two together, then scrape info from the individual shirt product page
                    linksToIndividualShirts[i] = "http://shirts4mike.com/" + data.data.shirts[i].url;
                    scrapeIndividualShirt(linksToIndividualShirts[i]);
                }

                // console.dir(infoForAllShirts);

            }
        });
}

// INITIAL SETUP
checkForDataFolder();
scrapeSite();

setTimeout(() => console.log(infoForAllShirts), 10000);