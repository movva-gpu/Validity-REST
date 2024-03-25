import express from 'express';

import Group from '../models/group';
import System from '../models/system';
import { PROJECT_URL, findUser } from '../../utils';

export const groupsRouter = express.Router();

groupsRouter.options('/', (_req, res) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.status(200).json({
        message: 'Welcome to the Validity REST API groups route',
        routes: {
            alters: {
                all: {
                    type: 'GET',
                    url: PROJECT_URL + '/groups'
                },
                one: {
                    type: 'GET',
                    url: PROJECT_URL + '/groups/{groups_id}'
                },
                create: {
                    type: 'POST',
                    url: PROJECT_URL + '/groups'
                },
            }
        }
    });
});

groupsRouter.get('/', (_req, res) => {
    Group.find().exec()
        .then(async (groups) => {
            let systemNames: { [key: string]: string } = {};
            for (const group of groups) {
                Group.findOne({ _id: group._system_id }).exec()
                    .then(group => {
                        if (!group || !group.group_name) return;
                        systemNames[group._id.toString()] = group.group_name.toString();
                    })
                    .catch(err => {
                        res.status(500).json({
                            message: 'An error ocurred',
                            error: err
                        });
                    });
            }
            res.status(200).json({
                count: groups.length,
                groups: {
                    groups: groups.map(group => {
                        return {
                            _id: group._id,
                            name: group.group_name,
                            display_name: group.group_display_name,
                            desc: group.group_desc,
                            color: group.group_color,
                            avatar_url: group.group_avatar_url,
                            banner_url: group.group_banner_url,
                            system_name: systemNames[group._system_id.toString()],
                            created_at: group.group_created_at
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

groupsRouter.post('/', async (req, res, next) => {
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

                    for (const group_id of system.group_ids) {
                        Group.findOne({ _id: group_id }).exec()
                            .then(group => {
                                if (group && group.group_name === req.body.name) {
                                    return res.status(409).json({
                                        error: 'Group name: ' + req.body.name + ' already exists'
                                    });
                                }
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'An error occurred',
                                    error: err
                                });
                            });

                            new Group({
                                group_name: req.body.name,
                                group_display_name: req.body.display_name,
                                group_desc: req.body.desc,
                                group_color: req.body.color,
                                group_avatar_url: req.body.avatar_url,
                                group_banner_url: req.body.banner_url,
                            }).save()
                                .then(group => {
                                    res.status(201).json({
                                        message: 'Created group successfully',
                                        createdGroup: /* group */ {
                                            _id: group._id,
                                            name: group.group_name,
                                            display_name: group.group_display_name,
                                            desc: group.group_desc,
                                            color: group.group_color,
                                            avatar_url: group.group_avatar_url,
                                            banner_url: group.group_banner_url,
                                            request: {
                                                type: 'GET',
                                                url: PROJECT_URL + '/groups/' + group._id
                                            },
                                            created_at: group.group_created_at
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
                                            if (!await Group.findOne({ system_name: newName }).exec() && !newNames.includes(newName) && suffix !== 0) {
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
                                                message: 'group name: ' + req.body.name + ' already exists',
                                                suggestions: newNames
                                            });
                                        });
                                    }
                                    const IS_USER_ID_CONFLICT = err.code === 11000 && err.keyValue.system_user_id
                                    const errorCode = err.code ? 'E' + err.code : 'Error';
                                    res.status(IS_USER_ID_CONFLICT ? 409 : 500).json({
                                        error:
                                            IS_USER_ID_CONFLICT ? 'E11000: User ' + err.keyValue.system_user_id + ' already has a group' :
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

// TODO: add group patching and deletion to a new system route /systems/:system_id_or_name/groups/:group_id_or_name

export default groupsRouter;
