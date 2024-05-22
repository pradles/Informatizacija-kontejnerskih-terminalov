import mongoose, {Schema} from "mongoose";

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
      type: String,
      required: true,
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
