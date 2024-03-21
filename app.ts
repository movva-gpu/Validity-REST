import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import systemsRouter from './API/routes/systems';
import altersRouter from './API/routes/alters';
import groupsRouter from './API/routes/groups';

const app = express();
const port = process.env.PORT || 3030;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/systems', systemsRouter);
app.use('/groups', groupsRouter);
app.use('/alters', altersRouter);

app.use('humans.txt', (_req, res) => {
    res.sendFile('humans.txt', { root: __dirname });
});

app.use((_req, _res, next) => {
    const error = new Error('Not found') as Error & { status: number };
    error.status = 404;
    next(error);
});

app.use((error: Error & { status: number }, _req: any, res: any, _next: Function): void => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
