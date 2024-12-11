import { execFile } from 'child_process';

export function getContractAddress(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    execFile(
      'python3',
      ['dist/notification_logic/get_notification.py'],
      (error: any, stdout: any, stderr: any) => {
        if (error) {
          return reject(error);
        }
        if (stderr) {
          return reject(new Error(stderr));
        }
        resolve(stdout.trim());
      }
    );
  });
}
