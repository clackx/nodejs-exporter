var cp = require('child_process')

module.exports = function exec(command) {
  
    return new Promise(function (resolve) {
      var runCommand = 'LC_ALL="en_US.UTF-8";LANG="en_US.UTF-8";LANGUAGE="en_US:en";' + command
  
      cp.exec(runCommand, { shell: true }, function (err, stdout, stderr) {
        
        if (err) console.log('exec error: '+ err.message)
        if (stderr) console.log('exec stderr: '+ stderr)
  
        return resolve(stdout)
      })
    })
  }