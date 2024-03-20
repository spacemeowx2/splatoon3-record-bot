import { spawn } from 'child_process'

export async function runCommand(command: string, args: string[]) {
    return new Promise<Buffer>((resolve, reject) => {
        const cmd = spawn(command, args);
        let result: Buffer[] = [];

        cmd.stdout.on('data', (data) => {
            result.push(data);
        });

        cmd.on('error', (error) => {
            reject(error);
        });

        cmd.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command exited with code ${code}`));
            } else {
                resolve(Buffer.concat(result));
            }
        });
    });
}