import express from 'express';
import { basicUUIDHandling } from '../../utils';

export const groupsRouter = express.Router();

groupsRouter.get('/', (_req, res) => {
    res.status(200).json({
        message: 'GET /groups'
    });
});

groupsRouter.post('/', (_req, res) => {
    res.status(201).json({
        message: 'POST /groups'
    });
});

groupsRouter.get('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `GET /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

groupsRouter.patch('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `PATCH /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

groupsRouter.delete('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `DELETE /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

export default groupsRouter;
