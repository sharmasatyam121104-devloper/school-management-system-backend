import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UploadedFile } from "express-fileupload";
import { catchError, tryError } from "../utils/errorHandler";
import { CounterModel } from "../model/counter.model";
import { uploadImage, uploadSingleFile } from "../utils/cloudinary";
import TeacherModel from "../model/teacher.model";
import UserModel from "../model/user.model";
import { nanoid } from "nanoid";


//Create techer 
//step:1 save professional data
export const saveProfessionalInfo = async (req: Request, res: Response) => {
  try {
    const {
      email,
      designation,
      department,
      joiningDate,
      employmentType,
      highestQualification,
      specialization,
      experienceYears,
      subjectsCanTeach,
    } = req.body;

    /* =========================
     EMAIL VALIDATION
    ========================== */
    if (!email) {
      throw tryError("Email is required", 400);
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw tryError("User not found", 404);
    }

    /* =========================
       DESIGNATION VALIDATION
    ========================== */
    const validDesignations = [
      "PGT",
      "TGT",
      "PRT",
      "HOD",
      "PRINCIPAL",
      "ADMIN_STAFF",
    ];

    if (!designation || !validDesignations.includes(designation)) {
      throw tryError("Valid designation is required", 400);
    }

    /* =========================
      JOINING DATE VALIDATION
    ========================== */
    if (!joiningDate) {
      throw tryError("Joining date is required", 400);
    }

    const date = new Date(joiningDate);
    if (isNaN(date.getTime())) {
      throw tryError("Invalid joining date", 400);
    }

    /* =========================
       EMPLOYMENT TYPE VALIDATION
    ========================== */
    const validEmploymentTypes = ["PERMANENT", "CONTRACT", "GUEST"];

    if (
      employmentType &&
      !validEmploymentTypes.includes(employmentType)
    ) {
      throw tryError("Invalid employment type", 400);
    }

    /* =========================
        REQUIRED TEXT FIELDS
    ========================== */
    if (!highestQualification) {
      throw tryError("Highest qualification is required", 400);
    }

    if (!specialization) {
      throw tryError("Specialization is required", 400);
    }

    /* =========================
        EXPERIENCE VALIDATION
    ========================== */
    if (
      experienceYears !== undefined &&
      (typeof experienceYears !== "number" || experienceYears < 0)
    ) {
      throw tryError("Experience must be a valid number", 400);
    }

    /* =========================
        SUBJECTS VALIDATION
    ========================== */
    if (
      !Array.isArray(subjectsCanTeach) ||
      subjectsCanTeach.length === 0
    ) {
      throw tryError("At least one subject is required", 400);
    }

    /* =========================
        UPDATE TEACHER + STEP
    ========================== */
    const updatedTeacher = await TeacherModel.create(
      {
        account: {
          user: user._id,
          teacherId: `T-${nanoid(5)}`,
          loginEnabled: true,
        },

        professional: {
          designation,
          department,
          joiningDate: date,
          employmentType,
          highestQualification,
          specialization,
          experienceYears: experienceYears || 0,
          subjectsCanTeach,
        },
        "registrationProgress.currentStep": "PROFESSIONAL",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Professional information saved successfully",
      data: updatedTeacher,
    });

  } catch (error) {
    return catchError(error, res);
  }
};

export const savePersonalInfo = async (req: Request, res: Response) => {
  try {
    const {
      email,
      gender,
      dob,
      primaryContact,
      emergencyContact,
      address,
    } = req.body;

    /* =========================
        EMAIL VALIDATION
    ========================== */
    if (!email) {
      throw tryError("Email is required", 400);
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw tryError("User not found", 404);
    }

    /* =========================
        TEACHER FIND BY USER ID
    ========================== */
    const teacher = await TeacherModel.findOne({
      "account.user": user._id,
    });

    if (!teacher) {
      throw tryError("Teacher profile not found", 404);
    }

    /* =========================
        VALIDATION
    ========================== */

    const validGenders = ["MALE", "FEMALE", "OTHER"];

    if (!gender || !validGenders.includes(gender)) {
      throw tryError("Valid gender is required", 400);
    }

    if (!dob) {
      throw tryError("Date of birth is required", 400);
    }

    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      throw tryError("Invalid date of birth", 400);
    }

    if (!primaryContact || !/^[0-9]{10}$/.test(primaryContact)) {
      throw tryError("Primary contact must be 10 digits", 400);
    }

    if (!emergencyContact) {
      throw tryError("Emergency contact is required", 400);
    }

    if (!address) {
      throw tryError("Address is required", 400);
    }

    const { street, city, state, pincode } = address;

    if (!street || !city || !state || !pincode) {
      throw tryError("Complete address is required", 400);
    }

    /* =========================
      UPDATE TEACHER
    ========================== */

    const updatedTeacher = await TeacherModel.findOneAndUpdate(
      { "account.user": user._id },

      {
        personal: {
          gender,
          dob: date,
          primaryContact,
          emergencyContact,
          address: {
            street,
            city,
            state,
            pincode,
          },
        },

        "registrationProgress.currentStep": "PERSONAL",
      },

      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Personal information saved successfully",
      data: updatedTeacher,
    });

  } catch (error) {
    return catchError(error, res);
  }
};


export const fetchTeacher = async (req: Request, res: Response) => {
  try {
    const teacher = await TeacherModel.find()
      .select("teacherId subjectsCanTeach experienceYears highestQualification status department")
      .populate("user", "name email mobile");

    if (teacher.length === 0) {
      throw tryError("Teacher data not found.", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Teacher list fetched successfully.",
      data: teacher,
    });
  } catch (error) {
    return catchError(error, res);
  }
};


export const getTeacherById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params; 
  

    if (!id) {
      throw tryError("Teacher ID is required", 400);
    }

    const teacher = await TeacherModel.findOne({user: id})
    .populate("user", "name email mobile");

    if (!teacher) {
      throw tryError("Teacher not found", 404);
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    return catchError(error, res);
  }
};

export const checkStatusOfRegistration = async (req: Request, res: Response) => {
  try {
    const {email} = req.body

    if(!email) {
      throw tryError("Email not found", 404);
    }

    const user = await UserModel.findOne({email})

    if(!user) {
      return res.send({status: "Not registerd"})
    }

    const teacherStatus = await TeacherModel.findOne({"account.user": user._id})
    
    if(!teacherStatus) {
      return res.send({status: "ACCOUNT"})
    }

    const status = teacherStatus?.registrationProgress?.currentStep

    res.send({status})

  } 
  catch (error) {
    console.log(error)
    return catchError(error, res)
  }
}
