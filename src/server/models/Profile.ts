import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId;
  pfpUrl?: string;
  bio?: string;
  birthdate?: Date;
  organisation?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    pfpUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    birthdate: { type: Date },
    organisation: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  { timestamps: true }
);

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;
