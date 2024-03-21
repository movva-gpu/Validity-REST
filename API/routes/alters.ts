import express from 'express';
import { basicUUIDHandling } from '../../utils';

export const altersRouter = express.Router();

altersRouter.get('/', (_req, res) => {
    res.status(200).json({
        message: 'GET /alters'
    });
});

altersRouter.post('/', (_req, res) => {
    res.status(201).json({
        message: 'POST /alters'
    });
});

altersRouter.get('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `GET /alters/${req.params.uid}`,
        uid: req.params.uid
    });
});

altersRouter.patch('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `PATCH /alters/${req.params.uid}`,
        uid: req.params.uid
    });
});

altersRouter.delete('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `DELETE /alters/${req.params.uid}`,
        uid: req.params.uid
    });
});

export default altersRouter;
