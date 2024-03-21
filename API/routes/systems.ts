import express from 'express';
import { basicUUIDHandling, isUUID } from '../../utils';

const systemsRouter = express.Router();

systemsRouter.get('/', (_req, res) => {
    res.status(200).json({
        message: 'GET /systems'
    });
});

systemsRouter.post('/', (req, res) => {
    const system = {
        name: req.body.name,
        color: req.body.color,
        createdAt: req.body.createdAt,
        userId: req.body.userId,
        description: req.body.description,
    };
    res.status(201).json({
        message: 'POST /systems',
        createdSystem: system
    });
});

systemsRouter.get('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `GET /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

systemsRouter.patch('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `PATCH /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

systemsRouter.delete('/:uid', (req, res) => {
    if (basicUUIDHandling(req, res)) return;
    res.status(200).json({
        message: `DELETE /systems/${req.params.uid}`,
        uid: req.params.uid
    });
});

export default systemsRouter;
