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
