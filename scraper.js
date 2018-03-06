const fs = require('fs');
const rimraf = require('rimraf'); // to remove folder with content, = command line rm -rf command
const csv = require('csv');
const scraper = require('website-scraper');
const jsdom = require('jsdom'); // create a virtaul DOM to traverse
const { JSDOM } = jsdom; // constructor for jsdom

// options for the scraper
const scraperOptions = {
    urls: ['http://shirts4mike.com/shirts.php'],
    directory: './html'
        // the following can be added to make the scraper recursive
        // recursive: true,
        // maxRecursiveDepth: '1',
        // maxDepth: '1' 
}

// check if there is a data folder; if not, create one
function checkForDataFolder() {
    if (!(fs.existsSync('./data'))) {
        fs.mkdirSync('./data');
    }
}

function scrapeSite() {
    rimraf.sync('./html'); // remove the directory in which the scraped html will be stored

    scraper(scraperOptions, (error, result) => {

        const dom = new JSDOM(result[0].text); // create a new DOM with jsdom
        list = dom.window.document.getElementsByClassName('products'); // traverse the dom
        console.log(list[0].innerHTML); // and this is the result!
    });
}


// INITIAL SETUP
checkForDataFolder();
scrapeSite();