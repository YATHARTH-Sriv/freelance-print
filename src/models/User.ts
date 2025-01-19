import mongoose ,{Schema,Document} from "mongoose";

export interface User extends Document {
    email: string;
    name: string;
    image: string;
    files: string[];
  }

const UserSchema: Schema<User>=new Schema({
    email: {type: String ,required: true,unique: true},
    name:{ type: String, required: true },
    image: String,
      files: [{
        type: Schema.Types.ObjectId,
        ref: 'File'
      }]
  },{timestamps:true})


const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;