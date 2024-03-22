import { NextFunction } from 'express';
import * as uuid from 'uuid';

export function isUUID(uid: string): boolean {
    try {
        uuid.parse(uid)
        return true;
    } catch (error) {
        return false;
    }
}

export function basicUUIDHandling(req: any, res: any): true | void {
    if (req.params.uid === '69' || req.params.uid === '42') {
        res.status(200).json({
            message: 'You think you\'re funny, don\'t you?'
        });
        return true;
    }
    if (!isUUID(req.params.uid)) {
        res.status(400).json({
            message: 'Invalid UUID'
        });
        return true;
    }
}

export type LogoOptions = {
    square: string,
    [shape: string]: string,
    root: string
};

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
