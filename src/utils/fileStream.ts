import fs from 'fs';
import { Notification } from 'element-ui';

export function writeFile(path: string, data: any) {
  const string = JSON.stringify(data);
  const buf = Buffer.from(string);
  fs.writeFileSync(path, buf);
}

export function readFile(path: string): any {
  try {
    const buf = fs.readFileSync(path);
    return JSON.parse(buf.toString());
  } catch (error) {
    Notification({
      title: '读取文件失败',
      message: error.message,
      type: 'error',
      position: 'bottom-right',
    });
  }
}
