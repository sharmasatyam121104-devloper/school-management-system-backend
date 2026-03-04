
import { Document, models, Types } from 'mongoose';

export interface ITeacher extends Document {
  // --- Data Groups ---
  account: {
    user: Types.ObjectId;
    teacherId: string;
    loginEnabled: boolean;
  };

  professional: {
    designation: string;
    department?: string;
    joiningDate: Date;
    employmentType: "PERMANENT" | "CONTRACT" | "GUEST";
    highestQualification: string;
    specialization: string;
    experienceYears: number;
    subjectsCanTeach: string[];
  };

  personal: {
    gender: "MALE" | "FEMALE" | "OTHER";
    dob: Date;
    primaryContact: string;
    emergencyContact: string;
    address: { street: string; city: string; state: string; pincode: string; };
  };

  finance: {
    salary: number;
    bankDetails?: { accountNumber: string; ifscCode: string; bankName: string; };
    documents: { aadhaarCard?: string; panCard?: string; certificates: string[]; photo: string[]; };
  };


  registrationProgress: {
    isAccountStepComplete: boolean;
    isProfessionalStepComplete: boolean;
    isPersonalStepComplete: boolean;
    isFinanceStepComplete: boolean;
    currentStep: "ACCOUNT" | "PROFESSIONAL" | "PERSONAL" | "FINANCE" | "COMPLETED";
  };

  // Global Status
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "RETIRED";
  remarks?: string;
  createdBy: Types.ObjectId;
}


import { Schema, model } from 'mongoose';

const teacherSchema = new Schema({
  account: {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: String, unique: true },
    loginEnabled: { type: Boolean, default: true }
  },

  professional: {
    designation: { type: String, required: true },
    department: String,
    joiningDate: { type: Date, required: true },
    employmentType: { type: String, enum: ["PERMANENT", "CONTRACT", "GUEST"] },
    highestQualification: String,
    specialization: String,
    experienceYears: { type: Number, default: 0 },
    subjectsCanTeach: [String]
  },

  personal: {
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    dob: Date,
    primaryContact: String,
    emergencyContact: String,
    address: { street: String, city: String, state: String, pincode: String }
  },

  finance: {
    salary: { type: Number, default: 0 },
    bankDetails: { accountNumber: String, ifscCode: String, bankName: String },
    documents: { aadhaarCard: String, panCard: String, certificates: [String], photo: [String] }
  },

  // --- Tracking Status Logic ---
  registrationProgress: {
    currentStep: { 
      type: String, 
      enum: ["ACCOUNT", "PROFESSIONAL", "PERSONAL", "FINANCE", "COMPLETED"],
      default: "ACCOUNT"
    }
  },

  status: { type: String, enum: ["ACTIVE", "ON_LEAVE", "RESIGNED", "RETIRED"], default: "ACTIVE" },
  remarks: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const TeacherModel = models.Teacher || model<ITeacher>("Teacher", teacherSchema);

export default TeacherModel;