import path from 'path';
import fs from 'fs';
import os from 'os';

const homedir = path.resolve(os.homedir(), '.electronexcel');
if (!fs.existsSync(homedir)) {
  fs.mkdirSync(homedir);
}

const userdir = path.resolve(homedir, `${os.userInfo().username}.json`);
try {
  const stat = fs.statSync(userdir);
  if (!stat.isFile()) {
    throw new Error(`create file ${userdir}`);
  }
} catch (error) {
  fs.writeFileSync(userdir, JSON.stringify({}));
}

export { userdir };
