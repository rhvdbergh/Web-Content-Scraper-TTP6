const fs = require('fs');
const scrapeIt = require('scrape-it'); // web scraper module
const json2csv = require('json2csv').parse;
const fields = [
        { label: 'Title', value: 'title' },
        { label: 'Price', value: 'price' },
        { label: 'Image URL', value: 'imageURL' },
        { label: 'URL', value: 'link' },
        { label: 'Time', value: 'time' }
    ] // column headings and fields to parse to CSV
const json2csvOptions = { fields };

let infoForAllShirts = []; // holds all the objects with info associated with each shirt product page
let remainingShirtsToScrape = 0; // holds the number of shirts to scrape, counts down as the data returns, when 0, all links returned

// prints error to console and appends error to log file
function handleError(error) {

    if (error.message.includes('ENOTFOUND')) {
        console.error('There was a problem connecting with the server. Please check whether you are connected to the internet, and whether http://shirts4mike.com is online.');

    } else {
        console.error(error);
    }

    // date and time on which error occurred
    const date = new Date();
    const errorDate = date.toString();

    // write the error to a log file
    fs.appendFile('./scraper-error.log', errorDate + ': ' + error + '\n', (error) => {
        if (error) throw (error);
    });
}

// check if there is a data folder; if not, create one
function checkForDataFolder() {
    if (!(fs.existsSync('./data'))) {
        fs.mkdirSync('./data');
    }
}

// converts the array of scraped data objects into a CSV file and saves it to the ./data folder
function writeToCSV() {

    // convert the JSON object infoForAllShirts to csv format
    try {
        const csv = json2csv(infoForAllShirts, json2csvOptions);

        // write csv to a file with the date in the format yyyy-mm-dd.csv in the ./data folder
        const date = new Date();
        let fileDate = `${date.getFullYear()}-${convertToTwoDigits(date.getMonth() + 1)}-${convertToTwoDigits(date.getDate())}`; // getMonth() is zero indexed, and getDate() returns day of month

        fs.writeFile(`./data/${fileDate}.csv`, csv, (error) => {
            if (error) throw (error);
            console.log('CSV file successfully saved!');
        })
    } catch (error) {
        handleError(error);
    }
}

// returns a string with 0 in front if a single digit is passed in
function convertToTwoDigits(number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return '' + number; // '' added to return a string
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
                handleError(error);
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
                const time = `${date.getHours()}:${convertToTwoDigits(date.getMinutes())}`;

                infoForAllShirts.push({ title, price, imageURL, link, time });
                remainingShirtsToScrape -= 1;
                if (remainingShirtsToScrape === 0) { // this is the last link to return data
                    console.log(`Data for all ${infoForAllShirts.length} shirts retrieved successfully ...`)
                    writeToCSV();
                }
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
                handleError(error);
            } else {
                // get the number of shirts to be scraped
                // remainingShirtsToScrape will count down as the links to individual shirts return data
                remainingShirtsToScrape = data.data.shirts.length;
                // traverse the data.data object to extract links to individual shirt
                // pages, and then assign to array
                //shirts[0].url
                for (let i = 0; i < data.data.shirts.length; i++) {
                    // the url returned does not include the domain name
                    // so add the two together, then scrape info from the individual shirt product page
                    linksToIndividualShirts[i] = "http://shirts4mike.com/" + data.data.shirts[i].url;
                    scrapeIndividualShirt(linksToIndividualShirts[i]);
                }
            }
        });
}

// ON START

// run program on startup
console.log('Scraper app started ...');
checkForDataFolder();
scrapeSite();

// repeat execution at intervals of one day ( = 86400000ms )
setInterval(() => {

    checkForDataFolder();
    scrapeSite();

}, 86400000); // run once each day