import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UploadedFile } from "express-fileupload";
import { catchError, tryError } from "../utils/errorHandler";
import { CounterModel } from "../model/counter.model";
import { uploadSingleFile } from "../utils/cloudinary";
import TeacherModel from "../model/teacher.model";
import UserModel from "../model/user.model";

const getSingleFile = (file: UploadedFile | UploadedFile[]) =>
  Array.isArray(file) ? file[0] : file;

export const createTeacher = async (req: Request, res: Response) => {
  let user: any = null;

  try {
    /* =========================
       1. PARSE FORM-DATA JSON
    ========================== */
    if (!req.body.data) throw tryError("Data is required", 400);

    let data: any;
    try {
      data = JSON.parse(req.body.data);
    } catch {
      throw tryError("Invalid JSON format in data field", 400);
    }

    /* =========================
       2. USER VALIDATION
    ========================== */
    const { name, email, mobile, password } = data.user || {};

    if (!name) throw tryError("Name is required", 400);
    if (!email) throw tryError("Email is required", 400);
    if (!mobile) throw tryError("Mobile number is required", 400);
    if (!password) throw tryError("Password is required", 400);

    /* =========================
       3. CHECK USER
    ========================== */
    user = await UserModel.findOne({ email });

    if (user) {
      if (user.role !== "TEACHER") {
        throw tryError("User exists but is not a teacher", 400);
      }

      const teacherExists = await TeacherModel.findOne({ user: user._id });
      if (teacherExists) {
        throw tryError("Teacher already exists for this user", 409);
      }
    } else {
      /* =========================
         4. CREATE USER
      ========================== */
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await UserModel.create({
        name,
        email,
        mobile,
        password: hashedPassword,
        role: "TEACHER",
      });
    }

    /* =========================
       5. GENERATE TEACHER ID
    ========================== */
    const counter = await CounterModel.findOneAndUpdate(
      { key: "teacher" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const teacherId = `T-${counter.seq}`;

    /* =========================
       6. ACADEMIC INFO
    ========================== */
    const {
      designation,
      department,
      employmentType,
      highestQualification,
      specialization,
      experienceYears,
      subjectsCanTeach,
    } = data.academicInfo || {};

    if (!designation) throw tryError("Designation is required", 400);
    if (!department) throw tryError("Department is required", 400);

    /* =========================
       7. BASIC INFO
    ========================== */
    const { gender, primaryContact, emergencyContact, dob } =
      data.basicInfo || {};

    if (!dob) throw tryError("Date of birth is required", 400);

    /* =========================
       8. PERSONAL + SALARY
    ========================== */
    const { address, bloodGroup } = data.personalInfo || {};
    const { salary, bankDetails } = data.salaryAndDocs || {};

    if (!salary) throw tryError("Salary is required", 400);
    if (!address) throw tryError("Address is required", 400);

    const { city, state, pincode, street } = address;

    if (!city || !state || !pincode || !street)
      throw tryError("Complete address is required", 400);

    /* =========================
       9. FILE VALIDATION
    ========================== */
    if (!req.files) throw tryError("Documents are required", 400);
    console.log("FILES 👉", req.files);


    const files = req.files as {
      certificates?: UploadedFile | UploadedFile[];
      aadhaarCard?: UploadedFile | UploadedFile[];
      panCard?: UploadedFile | UploadedFile[];
    };

    if (!files.certificates || !files.aadhaarCard || !files.panCard) {
      throw tryError("All documents are required", 400);
    }

    const certificatesFile = getSingleFile(files.certificates);
    const aadhaarFile = getSingleFile(files.aadhaarCard);
    const panFile = getSingleFile(files.panCard);

    /* =========================
       10. UPLOAD FILES
    ========================== */
    const certificatesUrl = await uploadSingleFile(certificatesFile);
    const aadhaarCardUrl = await uploadSingleFile(aadhaarFile);
    const panCardUrl = await uploadSingleFile(panFile);

    /* =========================
       11. CREATE TEACHER
    ========================== */
    const teacher = await TeacherModel.create({
      user: user._id,
      teacherId,

      designation,
      department,
      employmentType,
      highestQualification,
      specialization,
      experienceYears,
      subjectsCanTeach,

      gender,
      primaryContact,
      emergencyContact,
      dob: new Date(dob),
      joiningDate: new Date(),

      salary,
      bloodGroup,

      address: {
        city,
        state,
        pincode,
        street,
      },

      bankDetails,

      documents: {
        certificates: certificatesUrl,
        aadhaarCard: aadhaarCardUrl,
        panCard: panCardUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: teacher,
    });
  } catch (error) {
    return catchError(error, res);
  }
};
