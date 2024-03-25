import { NextFunction } from 'express';
import mongoose from 'mongoose';

export type LogoOptions = {
    square: string,
    [shape: string]: string,
    root: string
};

export const PROJECT_URL = process.env.URL || 'http://localhost:3030';

export function logoHandler(req: any, res: any, next: NextFunction, options: LogoOptions, onlyLogo = false): void {
    if (onlyLogo) {
        res.sendFile(options?.square, { root: options.root });
        return;
    }

    for (const shape in options) {
        if (shape === 'root') continue;
        const optionShape = options[shape];
        console.log(shape, optionShape);
        if (shape === req.params.shape && optionShape) {
            res.sendFile(optionShape, { root: options.root });
            return;
        }
    }

    const error = new Error('Invalid shape') as Error & { status: number };
    error.status = 400;
    next(error);
}

export async function findUser(user_id: string): Promise<any | void> {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bot ' + process.env.DISCORD_BOT_TOKEN);

    const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    let toReturn: any = {};

    await fetch('https://discord.com/api/v10/users/' + user_id, requestOptions)
        .then(async (response) => {
            try {
                toReturn = JSON.parse(await response.text());
            } catch (error) {
                console.error(error);
                toReturn = response.text();
            }
        }).catch(error => console.error(error));

    return toReturn;
}
