var cp = require("child_process"),
    http = require('http'),
    url = require('url'),
    path = require('path');

var SAFE_COMMAND_DIR = path.resolve(__dirname, 'safe-bin');

function validateCommandInput(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid command input');
    }

    if (value.length === 0 || value.length > 260) {
        throw new Error('Invalid command input length');
    }

    if (/[;&|`$<>!\r\n]/.test(value)) {
        throw new Error('Invalid command input characters');
    }

    var resolvedPath = path.resolve(value);

    if (resolvedPath.indexOf(SAFE_COMMAND_DIR + path.sep) !== 0) {
        throw new Error('Command path is outside the allowed directory');
    }

    return resolvedPath;
}

function validateHostInput(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid host input');
    }

    if (value.length === 0 || value.length > 253) {
        throw new Error('Invalid host input length');
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(value)) {
        throw new Error('Invalid host input characters');
    }

    return value;
}

var server = http.createServer(function(req, res) {
    let cmd = validateCommandInput(url.parse(req.url, true).query.path); // $ Sink Source

    cp.exec("foo");
    cp.execSync("foo");
    cp.execFile("foo");
    cp.execFileSync("foo");
    cp.spawn("foo");
    cp.spawnSync("foo");
    cp.fork("foo");


    cp.exec(cmd); // $ Alert
    cp.execSync(cmd); // $ Alert
    cp.execFile(cmd); // $ Alert
    cp.execFileSync(cmd); // $ Alert
    cp.spawn(cmd); // $ Alert
    cp.spawnSync(cmd); // $ Alert
    cp.fork(cmd); // $ Alert

    cp.exec("foo" + cmd + "bar"); // $ Alert

    // These are technically NOT OK, but they are more likely as false positives
    cp.exec("foo", {shell: cmd});
    cp.exec("foo", {env: {PATH: cmd}});
    cp.exec("foo", {cwd: cmd});
    cp.exec("foo", {uid: cmd});
    cp.exec("foo", {gid: cmd});

    let sh, flag;
    if (process.platform == 'win32')
      sh = 'cmd.exe', flag = '/c';
    else
      sh = '/bin/sh', flag = '-c';
    cp.spawn(sh, [ flag, cmd ]); // $ Alert

    let args = [];
    args[0] = "-c";
    args[1] = cmd; // $ Sink
    cp.execFile("/bin/bash", args); // $ Alert

    args = [];
    args[0] = "-c";
    args[1] = cmd; // $ Sink
    run("sh", args);

    args = [];
    args[0] = `-` + "c";
    args[1] = cmd; // $ Sink
    cp.execFile(`/bin` + "/bash", args); // $ Alert

    cp.spawn('cmd.exe', ['/C', 'foo'].concat(["bar", cmd])); // $ Alert
    cp.spawn('cmd.exe', ['/C', 'foo'].concat(cmd)); // $ Alert

    let myArgs = [];
    myArgs.push(`-` + "c");
    myArgs.push(cmd);
    cp.execFile(`/bin` + "/bash", myArgs); // $ MISSING: Alert - no support for `[].push()` for indirect arguments

});

function run(cmd, args) { // $ Sink
  cp.spawn(cmd, args); // $ Alert - but note that the sink is where `args` is build.
}

var util = require("util")

http.createServer(function(req, res) {
    let cmd = validateCommandInput(url.parse(req.url, true).query.path); // $ Source

    util.promisify(cp.exec)(cmd); // $ Alert
});


const webpackDevServer = require('webpack-dev-server');
new webpackDevServer(compiler, {
    before: function (app) {
        app.use(function (req, res, next) {
          var fileName = validateCommandInput(req.query.fileName);
          cp.exec(fileName); // $ Alert

          require("my-sub-lib").foo(fileName); // calls lib/subLib/index.js#foo
        });
    }
});

import Router from "koa-router";
const router = new Router();

router.get("/ping/:host", async (ctx) => {
  var host = validateHostInput(ctx.params.host);
  cp.execFile("ping", [host]); // $ Alert
});
