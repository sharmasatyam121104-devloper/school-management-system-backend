import { model, models, Document, Schema, Types } from 'mongoose';

export interface IStudent extends Document {
    user: Types.ObjectId;
    admissionNumber: string;
    rollNumber?: string;
    academicYear: string;
    class: string;
    section?: string;
    classTeacherId?: Types.ObjectId;
    photo: string;
    dob: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    bloodGroup?: string;
    nationality?: string;
    religion?: string;
    category?: "GEN" | "OBC" | "SC" | "ST";
    fatherName: string;
    motherName: string;
    guardianMobile: string;
    emergencyContact?: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    previousSchool?: string;
    documents?: {
        birthCertificate?: string;
        transferCertificate?: string;
        marksheet?: string;
        fitnessCertificate?: string;
    };
    medicalInfo?: {
        medicalConditions?: string;
        doctorName?: string;
    };
    transport?: {
        transportMode: "BUS" | "WALK" | "PRIVATE";
        busRoute?: string;
        pickupPoint?: string;
    };
    admissionDate: Date;
    status: "ACTIVE" | "INACTIVE" | "PROMOTED" | "DROPOUT";
    parentId?: Types.ObjectId;
    createdBy?: Types.ObjectId;
    remarks?: string;
    profileCompleted?: boolean;
}

const studentSchema = new Schema<IStudent>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "User reference is required"],
        },
        admissionNumber: {
            type: String,
            required: [true, "Admission number is required"],
            unique: true,
            trim: true,
            uppercase: true
        },
        rollNumber: { type: String, trim: true },
        academicYear: { 
            type: String, 
            required: [true, "Academic year is required"],
            match: [/^\d{4}-\d{2}$/, "Please use format YYYY-YY (e.g. 2025-26)"]
        },
        class: {
            type: String,
            required: [true, "Class is required"],
            enum: ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        },
        photo: {
            type: String,
            required: true
        },
        section: { type: String, uppercase: true, default: "A" },
        classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
        dob: { type: Date, required: true },
        gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
        bloodGroup: { 
            type: String, 
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] 
        },
        category: { type: String, enum: ["GEN", "OBC", "SC", "ST"], default: "GEN" },
        fatherName: { type: String, required: true, trim: true },
        motherName: { type: String, required: true, trim: true },
        guardianMobile: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, "Must be a 10-digit number"]
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true }
        },
        transport: {
            transportMode: { type: String, enum: ["BUS", "WALK", "PRIVATE"], default: "WALK" },
            busRoute: String,
            pickupPoint: String
        },
        documents: {
            birthCertificate: String,
            transferCertificate: String,
            marksheet: String,
            fitnessCertificateUrl: String,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "PROMOTED", "DROPOUT"],
            default: "ACTIVE"
        },
        profileCompleted: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Indexes for high-performance searching
studentSchema.index({ admissionNumber: 1 });
studentSchema.index({ class: 1, section: 1 });
studentSchema.index({ academicYear: 1 });

const StudentModel = models.Student || model<IStudent>("Student", studentSchema);
export default StudentModel;