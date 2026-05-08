const express = require("express");
const app = express();
const { execFile } = require("child_process");

function isSafeRemote(remote) {
  if (typeof remote !== "string") {
    return false;
  }

  if (remote.length === 0 || remote.length > 2048) {
    return false;
  }

  if (remote.startsWith("-")) {
    return false;
  }

  if (/[\s;&|`$<>\\]/.test(remote)) {
    return false;
  }

  return (
    /^https?:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/i.test(remote) ||
    /^ssh:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/i.test(remote) ||
    /^git@[A-Za-z0-9._-]+:[A-Za-z0-9._~/-]+$/i.test(remote)
  );
}

function isSafeGitArg(arg) {
  if (typeof arg !== "string") {
    return false;
  }

  if (arg.length === 0 || arg.length > 512) {
    return false;
  }

  if (arg.startsWith("-")) {
    return false;
  }

  return /^[A-Za-z0-9._/@:+-]+$/.test(arg);
}

function normalizeArgs(args) {
  if (args === undefined) {
    return [];
  }

  if (Array.isArray(args)) {
    return args.filter(isSafeGitArg);
  }

  if (typeof args === "string") {
    return isSafeGitArg(args) ? [args] : [];
  }

  return [];
}

function otherargs() {
  return [];
}

app.get("/", (req, res) => {
  const remote = req.query.remote; // $ Source

  if (!isSafeRemote(remote)) {
    return res.status(400).send("Invalid remote parameter");
  }

  execFile("git", ["ls-remote", "--", remote]); // fixed

  execFile("git", ["fetch", "--", remote]); // fixed

  indirect("git", ["ls-remote", "--", remote]); // fixed

  const myArgs = normalizeArgs(req.query.args); // $ Source

  execFile("git", myArgs); // fixed by argument validation

  if (remote.startsWith("--")) {
    execFile("git", ["ls-remote", "--", remote, "HEAD"]); // fixed
  } else {
    execFile("git", ["ls-remote", "--", remote, "HEAD"]); // fixed
  }

  if (remote.startsWith("git@")) {
    execFile("git", ["ls-remote", "--", remote, "HEAD"]); // fixed
  } else {
    execFile("git", ["ls-remote", "--", remote, "HEAD"]); // fixed
  }

  execFile("git", normalizeArgs(req.query.args)); // fixed

  execFile("git", ["add"].concat(normalizeArgs(req.query.args))); // fixed

  execFile("git", ["add", remote].concat(otherargs())); // fixed

  execFile("git", ["ls-remote", "--", remote].concat(normalizeArgs(req.query.otherArgs))); // fixed

  execFile("git", ["add", "fpp"].concat(normalizeArgs(req.query.notVulnerable))); // fixed

  // hg
  execFile("hg", ["clone", "--", remote]); // fixed

  execFile("hg", ["whatever", "--", remote]); // fixed

  execFile("hg", normalizeArgs(req.query.args)); // fixed

  execFile("hg", ["clone", "--", remote]);

  res.status(200).send("OK");
});

function indirect(cmd, args) {
  execFile(cmd, args);
}

app.listen(3000, () => console.log("Example app listening on port 3000!"));
