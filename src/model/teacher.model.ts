import { Document, model, models, Schema, Types } from 'mongoose';


export interface ITeacher extends Document {
  user: Types.ObjectId;

  teacherId: string;
  designation: string;             
  department?: string;              
  joiningDate: Date;
  employmentType?: "PERMANENT" | "CONTRACT" | "GUEST";

  highestQualification: string;
  specialization: string;
  experienceYears: number;

  subjectsCanTeach: string[];

  isClassTeacher?: boolean;
  classTeacherOf?: {
    class: string;
    section: string;
  };

  gender: "MALE" | "FEMALE" | "OTHER";
  dob: Date;
  bloodGroup?: string;
  primaryContact: string;
  emergencyContact: string;

  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  salary: number;

  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  documents?: {
    aadhaarCard?: string;
    panCard?: string;
    certificates?: string[];
  };

  loginEnabled?: boolean;
  lastLogin?: Date;

  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "RETIRED";
  remarks?: string;
  createdBy?: Types.ObjectId;
}


const teacherSchema = new Schema<ITeacher>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Teacher must be linked to a User account"],
    },
    teacherId: {
      type: String,
      required: [true, "Teacher ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    designation: { 
      type: String, 
      required: true,
      enum: ["PGT", "TGT", "PRT", "HOD", "PRINCIPAL", "ADMIN_STAFF"],
    },
    department: { type: String, trim: true },
    joiningDate: { type: Date, default: Date.now },
    employmentType: {
      type: String,
      enum: ["PERMANENT", "CONTRACT", "GUEST"],
      default: "PERMANENT",
    },
    highestQualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experienceYears: { type: Number, default: 0 },
    subjectsCanTeach: [{ type: String }],
    
    isClassTeacher: { type: Boolean, default: false },
    classTeacherOf: {
      class: { type: String },
      section: { type: String, uppercase: true },
    },

    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    dob: { type: Date, required: true },
    bloodGroup: { type: String },
    
    primaryContact: {
      type: String,
      required: [true, "Primary contact is required"],
      unique: true,
      match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    emergencyContact: { type: String, required: true },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    salary: { type: Number, required: true },
    bankDetails: {
      accountNumber: { type: String },
      ifscCode: { type: String, uppercase: true },
      bankName: { type: String },
    },

    documents: {
      aadhaarCard: String,
      panCard: String,
      certificates: [{ type: String }], // Array of strings (URLs)
    },

    loginEnabled: { type: Boolean, default: true },
    lastLogin: { type: Date },

    status: {
      type: String,
      enum: ["ACTIVE", "ON_LEAVE", "RESIGNED", "RETIRED"],
      default: "ACTIVE",
    },
    remarks: { type: String },
    // createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// --- Indexing for Performance ---
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ primaryContact: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ status: 1 });

const TeacherModel = models.Teacher || model<ITeacher>("Teacher", teacherSchema);

export default TeacherModel;