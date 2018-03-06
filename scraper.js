const fs = require('fs');
const rimraf = require('rimraf'); // to remove folder with content, = command line rm -rf command
const csv = require('csv');
const scraper = require('website-scraper');

// options for the scraper
const scraperOptions = {
    urls: ['http://shirts4mike.com/shirts.php'],
    directory: './html',
    recursive: true
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
    scraper(scraperOptions, (error, result) => {});
}


// INITIAL SETUP
rimraf.sync('./html'); // remove the directory in which the scraped html will be stored
checkForDataFolder();
scrapeSite();