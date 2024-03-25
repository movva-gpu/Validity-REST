import express, { NextFunction } from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fs from 'fs';

import systemsRouter from './API/routes/systems';
import altersRouter from './API/routes/alters';
import groupsRouter from './API/routes/groups';
import othersRouter from './API/routes/others';
import logoRouter from './API/routes/logo';
import { PROJECT_URL } from './utils';

const app = express();
const port = process.env.PORT || 3030;
const uri = 'mongodb+srv://' +
    encodeURIComponent(process.env.MONGO_USER as string) + ':' +
    encodeURIComponent(process.env.MONGO_PASSWORD as string) + '@validity-cluster.e4vgca6.mongodb.net/?retryWrites=true&w=majority&appName=validity-cluster';

mongoose.connect(uri).then(() => {
    console.log('Connected to database');
}).catch((error) => {
    console.log('[mongoose] Error connecting to database: ' + error);
});

const accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });

app.use(morgan(process.env.PRODUCTION === 'true' ? 'common' : 'dev', { stream: process.env.PRODUCTION === 'true' ? accessLogStream : process.stdout }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.use('/systems', systemsRouter);
app.use('/groups', groupsRouter);
app.use('/alters', altersRouter);
app.use('/logo', logoRouter);
app.use('/', othersRouter);

function options(_req: any, res: any) {
    res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET');
    res.status(200).json({
        message: 'Welcome to the Validity REST API',
        routes: {
            systems_url: PROJECT_URL + '/systems',
            system_url: PROJECT_URL + '/systems/{system_id}|{system_name}',
            groups_url: PROJECT_URL + '/groups',
            group_url: PROJECT_URL + '/groups/{group_id}|{group_name}',
            alters_url: PROJECT_URL + '/alters',
            alter_url: PROJECT_URL + '/alters/{alter_id}|{alter_name}',
            logos: PROJECT_URL + '/logo',
            'humans.txt': PROJECT_URL + '/humans.txt',
        }
    });
}

app.get('/', options);
app.options('/', options);

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
