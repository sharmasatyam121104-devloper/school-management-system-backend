import { Request, Response } from "express";
import { catchError, tryError } from "../../utils/errorHandler";
import bcrypt from "bcrypt";
import UserModel from "../user/user.model";
import StudentModel from "../student/student.model";
import { CounterModel } from "../counter/counter.model";
import { uploadImage } from "../../utils/cloudinary";
import { UploadedFile } from "express-fileupload";


export const createStudent = async(req: Request, res: Response)=>{
    try {
        let body = req.body
        if (!body) throw tryError("Data is required", 400);

        const {basicInfo, contactInfo, academicInfo, healthInfo} = body

        if(!basicInfo) {
            throw tryError("basicInfo is missing.", 404)
        }

        if(!contactInfo) {
            throw tryError("contactInfo is missing.", 404)
        }

        if(!academicInfo) {
            throw tryError("academicInfo is missing.", 404)
        }
        
        if(!healthInfo) {
            throw tryError("healthInfo is missing.", 404)
        }

        const {firstName, lastName, gender, dob, aadhaarNumber, religion, nationality, mobile, password } = basicInfo

        const basicInfoRequiredFields = [
            "firstName",
            "lastName",
            "gender",
            "dob",
            "aadhaarNumber",
            "religion",
            "nationality",
            "mobile",
            "password",
        ] as const;

        basicInfoRequiredFields.forEach((field) => {
            if (!basicInfo[field]) {
                throw tryError(`${field} is missing in basicInfo filed.`, 400);
            }
        });


        const {studentMobile, studentEmail, address, guardian } = contactInfo

        const contactInfoRequiredFields = [
            "studentMobile",
            "studentEmail",
            "address",
            "guardian",
        ] as const;

        contactInfoRequiredFields.forEach((field)=>{
            if(!contactInfo[field]) {
               throw tryError(`${field} is missing in contactInfo filed.`, 400); 
            }
        })

        const {current, permanent, city, state, pincode} = address

        const addressRequiredFields = [
            "current",
            "permanent",
            "city",
            "state",
            "pincode"
        ] as const;

        addressRequiredFields.forEach((field)=>{
            if(!address[field]) {
               throw tryError(`${field} is missing in address filed.`, 400); 
            }
        })
        
        const {fatherName, motherName, guardianName, guardianMobile, relation,guardianEmail} = guardian

        const guardianRequiredFields = [
            "fatherName",
            "motherName",
            "guardianName",
            "guardianMobile",
            "guardianEmail",
            "relation"
        ] as const;

        guardianRequiredFields.forEach((field)=>{
            if(!guardian[field]) {
               throw tryError(`${field} is missing  in guardian filed.`, 400); 
            }
        })

        const {admissionDate, academicYear, className, rollNumber , medium , stream , previousSchool, previousPercentage} = academicInfo

        const academicRequiredFields = [
            "admissionDate",
            "academicYear",
            "className",
            "rollNumber",
            "medium",
            "stream",
            "previousSchool",
            "previousPercentage",
        ] as const;

        academicRequiredFields.forEach((field) => {
            if (!academicInfo[field]) {
                throw tryError(`academicInfo.${field} is missing in academicInfo.`, 400);
            }
        });

        const {bloodGroup, medicalConditions , emergencyContact , doctorName } = healthInfo

        const healthRequiredFields = [
            "bloodGroup",
            "medicalConditions",
            "emergencyContact",
            "doctorName",
        ] as const;

        healthRequiredFields.forEach((field) => {
            if (!healthInfo[field]) {
                throw tryError(`healthInfo.${field} is missing in healthInfo`, 400);
            }
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        //logic
        let user = await UserModel.findOne({
            $or: [
                { email: studentEmail },
                { mobile: studentMobile }
            ]
        });

            const counter = await CounterModel.findOneAndUpdate(
            { key: "student" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if(user) {
            if (user.role !== "STUDENT") {
                throw tryError("User exists but is not a student", 400);
            }

            const student = await StudentModel.findOne({user: user._id}) 
            if(student) {
                throw tryError("Student already registered", 409);
            }
        }

        if(!user) {
            user = await UserModel.create({
                email: studentEmail,
                name: firstName+" "+lastName, 
                mobile: studentMobile, 
                password: hashedPassword, 
                role: "STUDENT"  
            })
        }

        const studentId = `STD-${counter.seq}`;


        const studentPayload = {
        studentId,
        basicInfo: {
            firstName,
            lastName,
            gender,
            dob,
            bloodGroup,
            aadhaarNumber,
            religion,
            nationality,
            mobile,
            password,
        },

        contactInfo: {
            studentMobile,
            studentEmail,

            address: {
                current,
                permanent,
                city,
                state,
                pincode,
            },

            guardian: {
                fatherName,
                motherName,
                guardianName,
                guardianMobile,
                guardianEmail,
                relation,
            },
        },

        academicInfo: {
            admissionDate,
            academicYear,
            className,
            rollNumber,
            medium,
            stream,
            previousSchool,
            previousPercentage,
        },

        healthInfo: {
            bloodGroup,
            medicalConditions,
            emergencyContact,
            doctorName,
        },
        user : user._id,
        accountStatus: "INCOMPLETE"
        };


        const student = await StudentModel.create(studentPayload)
        return res.json({message: "student creted successfully!", data: student})

    } 
    catch (error) {
        return catchError(error, res)    
    }
}

export const uploadStudentDocumnets = async(req: Request, res: Response)=>{
    try {
        const { id } = req.params; 
        if(!id) {
            throw tryError("Id is required.",404)
        }

        const user = await UserModel.findById(id)

        if(!user) {
            throw tryError("User not regiterd yet.",400)
        }

        if(user.role !== "STUDENT") {
            throw tryError("You are not eligible for file upload...Because u already register for some diffrent role.",400)
        }

        const student = await StudentModel.findOne({user: user._id}) 

        if (student && student.accountStatus === "ACTIVE") {
            throw tryError(
                "You have already uploaded student documents. To update, go to student update section.",
                400
            );
        }

        const file = req.files
        if(!file) {
            throw tryError("Data is required", 400);
        }
        const {birthCertificate, aadhaarCard, transferCertificate, marksheet, photo} = file
        const validateRequiredFiles = ["birthCertificate", "aadhaarCard", "transferCertificate", "marksheet", "photo"]

        validateRequiredFiles.forEach((filename)=>{
            if(!file[filename]) {
                throw tryError(`${filename} is missing in .`, 400);
            }
        })

        const getSingleFile = (file: UploadedFile | UploadedFile[]) =>
        Array.isArray(file) ? file[0] : file;

        const birthCertificateUrl = await uploadImage(getSingleFile(birthCertificate), "student");
        const aadhaarCardUrl = await uploadImage(getSingleFile(aadhaarCard), "student");
        const transferCertificateUrl = await uploadImage(getSingleFile(transferCertificate), "student");
        const marksheetUrl = await uploadImage(getSingleFile(marksheet), "student");
        const photoUrl = await uploadImage(getSingleFile(photo), "student");

        const payload = {
            documents : {
                birthCertificate: birthCertificateUrl,
                aadhaarCard: aadhaarCardUrl,
                transferCertificate: transferCertificateUrl,
                marksheet: marksheetUrl,
                photo: photoUrl,
            },
            accountStatus: "ACTIVE"
        }

        const registeredStudent = await StudentModel.findOneAndUpdate({user: user._id},payload)

        return res.json({message: "Student documents uploaded.!"})

    } 
    catch (error) {
        return catchError(error, res)    
    }
}

export const fetchAllStudent = async(req: Request, res: Response) => {
    try {
        const students = await StudentModel.find()
        .select("studentId academicInfo.className basicInfo.gender basicInfo.dob contactInfo.guardian.guardianName contactInfo.guardian.guardianMobile accountStatus")
        .populate("user", "name mobile createdAt")

        return res.json({message: "Data fetched successfully !", data: students})

    } 
    catch (error) {
        catchError(error,res)    
    }
}

export const fetchAllDataOfStudent = async(req: Request, res: Response) => {
    try {
        const { id } = req.params; 
        if(!id) {
            throw tryError("Id is required.",404)
        }

        const user = await StudentModel.findOne({user:id})
        .populate("user", "name mobile createdAt eamil")

        if(!user) {
            throw tryError("Student not found",404)
        }

        return res.json({message: "Student data fetched successfully.", data: user})

    } 
    catch (error) {
        return catchError(error, res)    
    }
}