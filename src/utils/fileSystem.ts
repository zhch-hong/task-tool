import { read, readFileSync, writeFileSync } from 'fs';
import { Notification } from 'element-ui';

export function writeFileText(path: string, data: any): void {
  try {
    const string = JSON.stringify(data);
    const buf = Buffer.from(string);
    writeFileSync(path, buf);
  } catch (error) {
    Notification({
      title: `写入文件失败`,
      message: `【${path}】${error.message}`,
      type: 'error',
      position: 'bottom-right',
    });
  }
}

export function readFileText(path: string): any {
  try {
    const buf = readFileSync(path);
    return JSON.parse(buf.toString());
  } catch (error) {
    Notification({
      title: `读取文件失败`,
      message: `【${path}】${error.message}`,
      type: 'error',
      position: 'bottom-right',
    });
  }
}

export function writeFileBinary(path: string, data: Buffer): void {
  try {
    writeFileSync(path, new Uint8Array(data));
  } catch (error) {
    Notification({
      title: `写入文件失败`,
      message: `【${path}】${error.message}`,
      type: 'error',
      position: 'bottom-right',
    });
  }
}

export function readFileBinary(path: string): Buffer | undefined {
  try {
    return readFileSync(path);
  } catch (error) {
    Notification({
      title: `读取文件失败`,
      message: `【${path}】${error.message}`,
      type: 'error',
      position: 'bottom-right',
    });
  }
}
