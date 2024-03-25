import express from 'express';
import { LogoOptions, logoHandler } from '../../utils';

export const logoRouter = express.Router();

const botLogoOptions: LogoOptions = {
    square: 'logo_512x512.jpg',
    portrait: 'logo_512x768.jpg',
    root: 'assets/images/bot'
};

const RESTLogoOptions: LogoOptions = {
    square: 'logo_128x128.png',
    portrait: 'logo_128x192.png',
    root: 'assets/images/REST'
};

const logoRoutes = [
    { path: ["/", "/bot"], options: botLogoOptions, onlyLogo: true },
    { path: "/bot/:shape", options: botLogoOptions },
    { path: "/REST", options: RESTLogoOptions, onlyLogo: true },
    { path: "/REST/:shape", options: RESTLogoOptions },
];

for (const { path, options, onlyLogo = false } of logoRoutes) {
    logoRouter.get(path, (req, res, next) => {
        logoHandler(req, res, next, options, onlyLogo);
    });
}

logoRouter.options('/', (_req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.status(200).json({
        message: 'Welcome to the Validity REST API logo route',
        routes: {
            bot: {
                square: 'GET /logo/bot',
                portrait: 'GET /logo/bot/portrait'
            },
            REST: {
                square: 'GET /logo/REST',
                portrait: 'GET /logo/REST/portrait'
            }
        }
    });
});

export default logoRouter;
