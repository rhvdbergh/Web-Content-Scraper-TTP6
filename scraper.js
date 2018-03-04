const fs = require('fs');

// check if there is a data folder; if not, create one
function checkForDataFolder() {
    if (!(fs.existsSync('./data'))) {
        fs.mkdirSync('./data');
    }
}

// INITIAL SETUP
checkForDataFolder();