import mongoose from 'mongoose';

const alterSchema = new mongoose.Schema({
    alter_name: { type: String, required: true },
    alter_display_name: String,
    alter_desc: String,
    alter_color: String,
    alter_avatar_url: String,
    alter_banner_url: String,
    alter_created_at: { type: Date, default: Date.now },
    group_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    _system_id: { type: mongoose.Types.ObjectId, ref: 'System', required: true }
});

const Alter = mongoose.model('Alter', alterSchema);

export default Alter;
