import mongoose from "mongoose";

const OwnerSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Owner", OwnerSchema);
