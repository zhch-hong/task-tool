import path from 'path';
import fs from 'fs';
import os from 'os';

const homedir = path.resolve(os.homedir(), '.electronexcel');
if (!fs.existsSync(homedir)) {
  fs.mkdirSync(homedir);
}

const configPath = path.resolve(homedir, `${os.userInfo().username}.json`);
try {
  const stat = fs.statSync(configPath);
  if (!stat.isFile()) {
    throw new Error(`create file ${configPath}`);
  }
} catch (error) {
  fs.writeFileSync(configPath, JSON.stringify({}));
}

export { configPath };
