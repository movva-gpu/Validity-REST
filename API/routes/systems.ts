import express from 'express';
import mongoose from 'mongoose';

import System from '../models/system';
import Alter from '../models/alter';
import Group from '../models/group';
import { PROJECT_URL, findUser } from '../../utils';

const systemsRouter = express.Router();

systemsRouter.options('/', (_req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.status(200).json({
        message: 'Welcome to the Validity REST API systems route',
        routes: {
            systems: {
                all: {
                    type: 'GET',
                    url: PROJECT_URL + '/systems',
                },
                one: {
                    type: 'GET',
                    url: PROJECT_URL + '/systems/{system_id}|{system_name}',
                },
                create: {
                    type: 'POST',
                    url: PROJECT_URL + '/systems',
                },
                update: {
                    type: 'PATCH',
                    url: PROJECT_URL + '/systems/{system_id}|{system_name}',
                },
                delete: {
                    type: 'DELETE',
                    url: PROJECT_URL + '/systems/{system_id}|{system_name}',
                }
            }
        }
    });
});

systemsRouter.get('/', (req, res) => {
    const systems = System.find().exec()
        .then(async (systems) => {
            const newAlters: { [key: string]: unknown[] } = {};
            const newGroups: { [key: string]: unknown[] } = {};
            const group_names: string[] = [];
            const alter_names: string[] = [];

            for (const system of systems) {
                if (!system.alter_ids) continue;
                for (const alter_id of system.alter_ids) {
                    let alter = await Alter.findOne({ _id: alter_id }).exec();
                    if (!alter) return;
                    if (alter.group_ids && alter.group_ids.length !== 0) {
                        for (const group_id of alter.group_ids) {
                            const group = await Group.findOne({ _id: group_id }).exec();
                            if (!group || !group.group_name) return;
                            group_names.push(group.group_name.toString())
                        }
                    }
                    // @ts-ignore
                    const newAlter = {
                        name: alter.alter_name,
                        display_name: alter.alter_display_name,
                        desc: alter.alter_desc,
                        color: alter.alter_color,
                        avatar_url: alter.alter_avatar_url,
                        banner_url: alter.alter_banner_url,
                        request: {
                            type: 'GET',
                            url: '/alters/' + alter._id
                        },
                        groups: group_names,
                        created_at: alter.alter_created_at,
                    }
                    newAlters[system._id.toString()].push(alter);
                }
                for (const group_id of system.group_ids) {
                    let group = await Group.findOne({ _id: group_id }).exec();
                    if (!group) return;
                    if (group.alter_ids && group.alter_ids.length !== 0) {
                        for (const alter_id of group.alter_ids) {
                            const alter = await Alter.findOne({ _id: alter_id }).exec();
                            if (!alter || !alter.alter_name) return;
                            alter_names.push(alter.alter_name.toString());
                        }
                    }
                    // @ts-ignore
                    const newGroup = {
                        name: group.group_name,
                        display_name: group.group_display_name,
                        desc: group.group_desc,
                        color: group.group_color,
                        avatar_url: group.group_avatar_url,
                        banner_url: group.group_banner_url,
                        request: {
                            type: 'GET',
                            url: '/groups/' + group._id
                        },
                        alters: alter_names,
                        created_at: group.group_created_at,
                    }
                    newGroups[system._id.toString()].push(group);
                }
            }
            res.status(200).json({
                count: systems.length,
                systems: systems.map((system) => {
                    return {
                        _id: system._id,
                        name: system.system_name,
                        display_name: system.system_display_name,
                        userId: system.system_user_id,
                        desc: system.system_desc,
                        color: system.system_color,
                        avatar_url: system.system_avatar_url,
                        banner_url: system.system_banner_url,
                        request: {
                            type: 'GET',
                            url: '/systems/' + system._id
                        },
                        alters: newAlters[system._id.toString()] || [],
                        groups: newGroups[system._id.toString()] || [],
                        created_at: system.system_created_at
                    };
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'An error occurred',
                error: err
            });
        });
});

systemsRouter.post('/', (req, res) => {
    if (!req.body.name) return res.status(400).json({
        error: 'The field "name" is required'
    });
    if (!req.body.userId) return res.status(400).json({
        error: 'The field "userId" is required'
    });

    findUser(req.body.userId)
        .then(user => {
            if (!user || user.code) return res.status(404).json({
                error: 'User ID not found' || user.message
            });

            const system = new System({
                system_name: req.body.name,
                system_display_name: req.body.display_name,
                system_user_id: req.body.userId,
                system_desc: req.body.desc,
                system_color: req.body.color,
                system_avatar_url: req.body.avatar_url,
                system_banner_url: req.body.banner_url,
                alter_ids: req.body.alter_ids,
                group_ids: req.body.group_ids
            });
            system.save()
                .then(result => {
                    res.status(201).json({
                        message: 'POST /systems',
                        createdSystem: /* system */ {
                            _id: system._id,
                            name: system.system_name,
                            display_name: system.system_display_name,
                            userId: system.system_user_id,
                            desc: system.system_desc,
                            color: system.system_color,
                            avatar_url: system.system_avatar_url,
                            banner_url: system.system_banner_url,
                            request: {
                                type: 'GET',
                                url: '/systems/' + system._id
                            },
                            created_at: system.system_created_at
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
                            if (!await System.findOne({ system_name: newName }).exec() && !newNames.includes(newName) && suffix !== 0) {
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
                                message: 'System name: ' + req.body.name + ' already exists',
                                suggestions: newNames
                            });
                        });
                    }
                    const IS_USER_ID_CONFLICT = err.code === 11000 && err.keyValue.system_user_id
                    const errorCode = err.code ? 'E' + err.code : 'Error';
                    res.status(IS_USER_ID_CONFLICT ? 409 : 500).json({
                        error:
                            IS_USER_ID_CONFLICT ? 'E11000: User ' + err.keyValue.system_user_id + ' already has a system' :
                            errorCode + ': An error occurred, please try again later or submit an issue at ' +
                            'https://github.com/movva-gpu/Validity-REST/issues/new' +
                            '?title=' + errorCode +
                            '&body=' + encodeURIComponent(err)
                    });
                });
        });
});

systemsRouter.get('/:idOrName', (req, res) => {
    const show__v = req.query.__v === 'true' || false;
    System.findOne(
        mongoose.Types.ObjectId.isValid(req.params.idOrName) ?
        { _id: req.params.idOrName } :
        { system_name: req.params.idOrName })
        .select((show__v ? '' : '-__v')).exec()
        .then(system => {
            if (!system) return res.status(404).json({ error: 'System not found' });
            res.status(200).json({
                message: `GET /systems/${req.params.idOrName}`,
                system: system
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'An error occurred',
                error: err
            });
        });
});

// TODO: add get for /:idOrName/:field

systemsRouter.patch('/:idOrName', async (req, res, next) => {
    if (!req.body.userId) return res.status(400).json({
        error: 'The field "userId" is required'
    });

    if (!((body: any): boolean => {
        if (!body || !body.props || !Array.isArray(body.props)) {
            return false;
        }

        const validProps = ['name', 'display_name', 'userId', 'desc', 'color', 'avatar_url', 'banner_url', 'alter_ids', 'group_ids'];

        for (const prop of body.props) {
            if (!validProps.includes(prop.propName) || (prop.propName === 'userId' && typeof prop.value !== 'string')) {
                return false;
            }
        }

        return typeof body.userId === 'string';
    })(req.body)) return res.status(400).json({
        error: 'Invalid body'
    });
    System.findOne(
        mongoose.Types.ObjectId.isValid(req.params.idOrName) ?
        { _id: req.params.idOrName } :
        { system_name: req.params.idOrName }).exec()
        .then(system => {
            if (!system) return res.status(404).json({ error: 'System not found' });

            for (const prop of req.body.props) {
                if (prop.propName === 'name') {
                    system.system_name = prop.value;
                } else if (prop.propName === 'display_name') {
                    system.system_display_name = prop.value;
                } else if (prop.propName === 'userId') {
                    system.system_user_id = prop.value;
                } else if (prop.propName === 'desc') {
                    system.system_desc = prop.value;
                } else if (prop.propName === 'color') {
                    system.system_color = prop.value;
                } else if (prop.propName === 'avatar_url') {
                    system.system_avatar_url = prop.value;
                } else if (prop.propName === 'banner_url') {
                    system.system_banner_url = prop.value;
                } else if (prop.propName === 'alter_ids') {
                    system.alter_ids = prop.value;
                } else if (prop.propName === 'group_ids') {
                    system.group_ids = prop.value;
                }
            }

            system.save()
                .then(() => {
                    res.status(200).json({
                        message: 'System updated',
                        updatedSystem: {
                            _id: system._id,
                            name: system.system_name,
                            display_name: system.system_display_name,
                            userId: system.system_user_id,
                            desc: system.system_desc,
                            color: system.system_color,
                            avatar_url: system.system_avatar_url,
                            banner_url: system.system_banner_url,
                            request: {
                                type: 'GET',
                                url: '/systems/' + system._id
                            },
                            created_at: system.system_created_at
                        }
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message: err.code === 11000 ?
                            'E11000: ' + (err.keyValue.system_user_id ?
                                'User ' + err.keyValue.system_user_id + ' already has a system' :
                            err.keyValue.system_name ?
                                'System name: ' + err.keyValue.system_name + ' already exists' :
                                'An error occurred') :
                            'An error occurred'
                    });
                    next()
                });
        })
        .catch(err => {
            res.status(500).json({
                message: 'An error occurred',
                error: err
            });
        });
});

systemsRouter.delete('/:idOrName', (req, res) => {
    System.findOneAndDelete(
        mongoose.Types.ObjectId.isValid(req.params.idOrName) ?
        { _id: req.params.idOrName } :
        { system_name: req.params.idOrName }).exec()
        .then(() => {
            res.status(200).json({
                message: `System deleted`,
                request: {
                    type: 'POST',
                    message: 'Create a new system',
                    url: '/systems',
                    body: {
                        name: 'String',
                        display_name: 'String',
                        userId: 'String',
                        desc: 'String',
                        color: 'String',
                        avatar_url: 'String',
                        banner_url: 'String'
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                message: 'An error occurred',
                error: err
            });
        });
});

export default systemsRouter;
