import {model, models, Document, Schema} from 'mongoose';

export type UserRole = "OTHER" | "TEACHER" | "STUDENT" | "PARENT";

export interface IUser extends Document {
    name: string
    email: string
    mobile: string
    password: string
    isActive: boolean
    lastLogin?: Date
    createdAt: Date
    updatedAt: Date
    role: UserRole
};

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ["OTHER", "TEACHER", "STUDENT", "PARENT"],
            message: "{VALUE} is not a valid role",
        },
        default: "STUDENT",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
},
{timestamps: true});

const UserModel = models.User || model("User", userSchema);

export default UserModel;