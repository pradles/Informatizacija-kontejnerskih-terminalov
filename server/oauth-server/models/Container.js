import mongoose, {Schema} from "mongoose";

const ContainerSchema = mongoose.Schema(
    {
        containerNumber: {
            type: Number,
            required: true,
        },
        size: {
            type: Number,
            enum: [0, 1, 2],
            required: true
        },
        contents: {
            type: String,
            required: true,
        },
        storageType: {
            type: Number,
            enum: [1, 2],
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
        ownerId: {
            type: [Schema.Types.ObjectId],
            ref: "Owner",
            required: true,
          },
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Container", ContainerSchema);
