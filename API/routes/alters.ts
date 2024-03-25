import express from 'express';
import mongoose from 'mongoose';

import Alter from '../models/alter';
import { findUser } from '../../utils';
import System from '../models/system';

const altersRouter = express.Router();

altersRouter.options('/', (_req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.status(200).json({
        message: 'Welcome to the Validity REST API alters route',
        routes: {
            alters: {
                all: {
                    type: 'GET',
                    url: '/alters'
                },
                one: {
                    type: 'GET',
                    url: '/alters/{alters_id}'
                },
                create: {
                    type: 'POST',
                    url: '/alters'
                },
            }
        }
    });
});

altersRouter.get('/', (_req, res) => {
    Alter.find().exec()
        .then(async (alters) => {
            let systemNames: { [key: string]: string } = {};
            for (const alter of alters) {
                Alter.findOne({ _id: alter._system_id }).exec()
                    .then(alter => {
                        if (!alter || !alter.alter_name) return;
                        systemNames[alter._id.toString()] = alter.alter_name.toString();
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: 'An error ocurred',
                            error: err
                        });
                    });
            }
            res.status(200).json({
                count: alters.length,
                alters: {
                    alters: alters.map(alter => {
                        return {
                            _id: alter._id,
                            name: alter.alter_name,
                            display_name: alter.alter_display_name,
                            desc: alter.alter_desc,
                            color: alter.alter_color,
                            avatar_url: alter.alter_avatar_url,
                            banner_url: alter.alter_banner_url,
                            systemName: systemNames[alter._system_id.toString()],
                            created_at: alter.alter_created_at
                        }
                    })
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'An error ocurred',
                error: err
            });
        });
});

altersRouter.post('/', async (req, res, next) => {
    if (!req.body.name) return res.status(400).json({
        error: 'The field "name" is required'
    });
    if (!req.body.user_id) return res.status(400).json({
        error: 'The field "user_id" is required'
    });

    findUser(req.body.user_id)
        .then(user => {
            if (!user || user.code) return res.status(404).json({
                error: 'User ID not found' || user.message
            });

            System.findOne({ system_user_id: req.body.user_id }).exec()
                .then(system => {
                    if (!system) return res.status(404).json({
                        error: 'System not found'
                    });

                    for (const alter_id of system.alter_ids) {
                        Alter.findOne({ _id: alter_id }).exec()
                            .then(alter => {
                                if (alter && alter.alter_name === req.body.name) {
                                    return res.status(409).json({
                                        error: 'Alter name: ' + req.body.name + ' already exists'
                                    });
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'An error occurred',
                                    error: err
                                });
                            });

                            new Alter({
                                alter_name: req.body.name,
                                alter_display_name: req.body.display_name,
                                alter_desc: req.body.desc,
                                alter_color: req.body.color,
                                alter_avatar_url: req.body.avatar_url,
                                alter_banner_url: req.body.banner_url,
                            }).save()
                                .then(alter => {
                                    res.status(201).json({
                                        message: 'POST /systems',
                                        createdAlter: /* alter */ {
                                            _id: alter._id,
                                            name: alter.alter_name,
                                            display_name: alter.alter_display_name,
                                            desc: alter.alter_desc,
                                            color: alter.alter_color,
                                            avatar_url: alter.alter_avatar_url,
                                            banner_url: alter.alter_banner_url,
                                            request: {
                                                type: 'GET',
                                                url: '/systems/' + alter._id
                                            },
                                            created_at: alter.alter_created_at
                                        }
                                    });
                                })
                                .catch(async err => {
                                    if (err.code === 11000 && err.keyValue.system_name) {
                                        let i = 0;
                                        let success = 0;
                                        const newNames: string[] = [];
                                        return await (async () => {
                                            while (success !== 5 && i < 200) {
                                            const suffix = Math.floor(Math.random() * (i < 50 ? 1e2 : (i < 150 ? 1e3 : 1e4)));
                                            const newName = req.body.name + suffix;
                                            if (!await Alter.findOne({ system_name: newName }).exec() && !newNames.includes(newName) && suffix !== 0) {
                                                success++;
                                                newNames.push(newName);
                                            }
                                            i++;
                                            }
                                        })().then(() => {
                                            if (i >= 200) return res.status(500).json({
                                                message: 'An error occurred, please try again later'
                                            });

                                            res.status(409).json({
                                                message: 'alter name: ' + req.body.name + ' already exists',
                                                suggestions: newNames
                                            });
                                        });
                                    }
                                    const IS_USER_ID_CONFLICT = err.code === 11000 && err.keyValue.system_user_id
                                    const errorCode = err.code ? 'E' + err.code : 'Error';
                                    res.status(IS_USER_ID_CONFLICT ? 409 : 500).json({
                                        error:
                                            IS_USER_ID_CONFLICT ? 'E11000: User ' + err.keyValue.system_user_id + ' already has a alter' :
                                            errorCode + ': An error occurred, please try again later or submit an issue at ' +
                                            'https://github.com/movva-gpu/Validity-REST/issues/new' +
                                            '?title=' + errorCode +
                                            '&body=' + encodeURIComponent(err)
                                    });
                                });
                    }
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'An error occurred',
                        error: err
                    });
                });
        });
});

// TODO: add alter patching and deletion to a new system route /systems/:system_id_or_name/alters/:alter_id_or_name

export default altersRouter;
