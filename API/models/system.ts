import mongoose from 'mongoose';

const systemSchema = new mongoose.Schema({
    system_name: { type: String, unique: true },
    system_display_name: String,
    system_user_id: { type: String, unique: true },
    system_desc: String,
    system_color: String,
    system_avatar_url: String,
    system_banner_url: String,
    alter_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alter' }],
    group_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    system_created_at: { type: Date, default: Date.now },
});

const System = mongoose.model('System', systemSchema);

export default System;


