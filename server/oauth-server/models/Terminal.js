import mongoose from "mongoose";

const CellSchema = new mongoose.Schema({
    occupation: { type: mongoose.Schema.Types.ObjectId, ref: 'Container', default: null },
    size: { type: Number, enum: [0, 1, 2], default: null },
    accessibility: { type: Number, enum: [0, 1, 2], default: 2 }
  }, { _id: false });

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
        array3D: {
            type: [[[CellSchema]]], 
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Terminal", Terminal);
