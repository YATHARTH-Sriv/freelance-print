import mongoose, { Schema, Document } from "mongoose";

export interface File extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  filename: string;
  fileType: string;
  uploadDate: Date;
  status: 'pending' | 'processing' | 'completed';
}

const FileSchema: Schema<File> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

const FileModel = 
  (mongoose.models.File as mongoose.Model<File>) ||
  mongoose.model<File>('File', FileSchema);

export default FileModel;