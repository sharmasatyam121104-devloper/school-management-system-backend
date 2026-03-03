import { Document, model, models, Schema, Types } from 'mongoose';


export interface IParent extends Document {
  user: Types.ObjectId;
  students: Types.ObjectId[];
  parentCode: string;     

  fatherName: string;
  fatherOccupation?: string;
  motherName: string;
  motherOccupation?: string;

  primaryContact: string;
  secondaryContact?: string;

  whatsappNumber?: string;
  email?: string;
  preferredContactMode?: "SMS" | "CALL" | "WHATSAPP" | "EMAIL";

  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };

  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  annualIncome?: number;
  relationToStudent: "FATHER" | "MOTHER" | "GUARDIAN";

  loginEnabled?: boolean;
  lastLogin?: Date;

  status: "ACTIVE" | "INACTIVE";

  createdBy?: Types.ObjectId;
  remarks?: string;
}


const parentSchema = new Schema<IParent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Parent must be linked to a User account"],
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    fatherOccupation: { type: String, trim: true },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },
    motherOccupation: { type: String, trim: true },
    parentCode: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    primaryContact: {
      type: String,
      required: [true, "Primary contact number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit mobile number"],
    },
    secondaryContact: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    preferredContactMode: {
      type: String,
      enum: ["SMS", "CALL", "WHATSAPP", "EMAIL"],
      default: "CALL",
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    annualIncome: { type: Number },
    relationToStudent: {
      type: String,
      enum: ["FATHER", "MOTHER", "GUARDIAN"],
      required: [true, "Relation to student is required"],
    },
    loginEnabled: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// --- Optimization: Indexing ---
// We index primaryContact and email because these will be used most for searching/login
parentSchema.index({ primaryContact: 1 });
parentSchema.index({ email: 1 });

const ParentModel = models.Parent || model<IParent>("Parent", parentSchema);

export default ParentModel;