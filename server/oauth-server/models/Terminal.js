import mongoose from "mongoose";

const Terminal = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        location: {
            type: String,
            required: true,
        },
        //need to add storage
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Terminal", Terminal);
