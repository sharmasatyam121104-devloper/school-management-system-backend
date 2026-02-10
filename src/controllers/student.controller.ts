import { Request, Response } from "express";
import { catchError, tryError } from "../utils/errorHandler";
import bcrypt from "bcrypt";
import UserModel from "../model/user.model";
import StudentModel, { IStudent } from "../model/student.model";
import { CounterModel } from "../model/counter.model";


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