import mongoose, {Schema} from "mongoose";

// Define a schema for the position
const PositionSchema = new Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  z: {
    type: Number,
    required: true,
  }
});

const StorageSchema = mongoose.Schema(
  {
    containerId: {
      type: [Schema.Types.ObjectId],
      ref: "Container",
      required: true,
    },
    terminalId: {
      type: [Schema.Types.ObjectId],
      ref: "Terminal",
      required: true,
    },
    dateImported: {
      type: Date,
      required: true,
    },
    dateExported: {
      type: Date,
      required: false,
    },
    currentlyStoredAt: {
      type: PositionSchema,
      required: false,
    },
    dateScheduledForExport: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Storage", StorageSchema);
