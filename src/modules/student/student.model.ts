import { Schema, model, Document, Types } from "mongoose";

//    Interfaces

export interface IStudent extends Document {
    studentId: string;

    basicInfo: {
        firstName: string;
        lastName: string;
        gender: "MALE" | "FEMALE" | "OTHER";
        dob: string;
        bloodGroup?: string;
        aadhaarNumber?: string;
        religion?: string;
        nationality: string;
        mobile: string;
        password: string
    };

    contactInfo: {
        studentMobile: string;
        studentEmail: string;

        address: {
            current: string;
            permanent: string;
            city: string;
            state: string;
            pincode: string;
        };

        guardian: {
            fatherName?: string;
            motherName?: string;
            guardianName: string;
            guardianMobile: string;
            guardianEmail?: string;
            relation: string;
        };
    };

    academicInfo: {
        admissionDate: Date;
        academicYear: string;
        className: string;
        rollNumber: string;
        medium: "ENGLISH" | "HINDI";
        stream?: "SCIENCE" | "COMMERCE" | "ARTS";
        previousSchool?: string;
        previousPercentage?: number;
    };

    healthInfo?: {
        bloodGroup?: string;
        medicalConditions?: string;
        emergencyContact?: string;
        doctorName?: string;
    };

    documents?: {
        birthCertificate?: string;
        aadhaarCard?: string;
        transferCertificate?: string;
        marksheet?: string;
        photo?: string;
    };

    user: Types.ObjectId;
    accountStatus: "ACTIVE" | "INCOMPLETE" | "INACTIVE";
    lastLogin?: Date;
}

//   Schema

const studentSchema = new Schema<IStudent>({
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /* ---------- Basic Info ---------- */
    basicInfo: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
        required: true,
      },
      dob: { type: Date, required: true },
      bloodGroup: { type: String },
      aadhaarNumber: { type: String },
      religion: { type: String },
      nationality: { type: String, required: true },
      mobile: {type: String, required: true},
      password: {type: String, required: true},
    },

    /* ---------- Contact Info ---------- */
    contactInfo: {
      studentMobile: {
        type: String,
        required: true,
        match: /^[6-9]\d{9}$/,
      },
      studentEmail: {
        type: String,
        required: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },

      address: {
        current: { type: String, required: true },
        permanent: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: {
          type: String,
          required: true,
          match: /^\d{6}$/,
        },
      },

      guardian: {
        fatherName: String,
        motherName: String,
        guardianName: { type: String, required: true },
        guardianMobile: {
          type: String,
          required: true,
          match: /^[6-9]\d{9}$/,
        },
        guardianEmail: {
          type: String,
          match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
        relation: { type: String, required: true },
      },
    },

    /* ---------- Academic Info ---------- */
    academicInfo: {
        admissionDate: { type: Date, required: true },
        academicYear: { type: String, required: true },
        className: { type: String, required: true },
        rollNumber: { type: String, required: true },
        medium: {
            type: String,
            enum: ["ENGLISH", "HINDI"],
            required: true,
        },
        stream: {
            type: String,
            enum: ["SCIENCE", "COMMERCE", "ARTS"],
        },
        previousSchool: String,
        previousPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },
    },

    /* ---------- Health Info ---------- */
    healthInfo: {
        bloodGroup: String,
        medicalConditions: String,
        emergencyContact: String,
        doctorName: String,
    },

    /* ---------- Documents ---------- */
    documents: {
        birthCertificate: String,
        aadhaarCard: String,
        transferCertificate: String,
        marksheet: String,
        photo: String,
    },

    /* ---------- Login / System ---------- */
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    accountStatus: {
        type: String,
        enum: ["ACTIVE","INCOMPLETE", "INACTIVE"],
        default: "ACTIVE",
    },

    lastLogin: Date,
},

{ timestamps: true });

const StudentModel = model<IStudent>("Student", studentSchema);

export default StudentModel 
