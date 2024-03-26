import express from 'express';

export const othersRouter = express.Router();

othersRouter.use('/', (_req, _res, next) => {
    next();
});

othersRouter.get(
    ['/humans.txt', '/humans', '/authors', '/author', '/authors.txt', '/author.txt'],
    (_req, res) => {
        res.sendFile('humans.txt', { root: 'assets' });
    }
);

export default othersRouter;
