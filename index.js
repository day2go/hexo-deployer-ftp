var spawn = require('child_process').spawn;

var public_dir = hexo.config.public_dir || './public';

// run function which supports interactive commands
function run (command, args, callback) {
  process.stdin.pause();
  process.stdin.setRawMode(false);

  var p = spawn(command, args, {
    customFds: [0, 1, 2]
  });
  return p.on('exit', function() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    return callback();
  });
}

hexo.extend.deployer.register('ftp', function (args, callback) {
  var config = hexo.config.deploy;

  if (!config.host || !config.user || !config.root){
    var help = [
      'You should configure deployment settings in _config.yml first!',
      '',
      'Example:',
      '  deploy:',
      '    type: ftp',
      '    host: <host>',
      '    user: <user>',
      '    root: <root>',
      '',
      'For more help, you can check the docs: ' + 'http://zespia.tw/hexo/docs/deployment.html'
    ];

    console.log(help.join('\n'));
    return callback();
  }

  var ftpArgs = [
    '-e',
    (args.f || args.force) ?
      'mirror -R               --delete -v ' + public_dir + ' ' + config.root + '; bye' :
      'mirror -R --ignore-time --delete -v ' + public_dir + ' ' + config.root + '; bye',
    '-u',
    config.user,
    config.host
  ];

  run('lftp', ftpArgs, function (code) {
    callback();
  });
});
