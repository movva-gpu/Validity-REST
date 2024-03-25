import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    group_name: { type: String, required: true },
    group_display_name: String,
    group_desc: String,
    group_color: String,
    group_avatar_url: String,
    group_banner_url: String,
    group_created_at: { type: Date, default: Date.now },
    alter_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    _system_id: { type: mongoose.Types.ObjectId, ref: 'System', required: true }
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
