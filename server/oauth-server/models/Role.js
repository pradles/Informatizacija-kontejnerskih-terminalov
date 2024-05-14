import mongoose, {Schema} from "mongoose";

const RoleSchema = mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
            unique: true
        },
        terminals: {
            type: [Schema.Types.ObjectId],
            ref: "Terminal"
        },
        access: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Role", RoleSchema);
