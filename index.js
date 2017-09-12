process.chdir(__dirname); //working directory should be the installation directory so we can refer to local files, even if launched from elsewhere
process.umask(0); //make any files or directories we create have the mode we specify
module.exports = require('./lib/server');