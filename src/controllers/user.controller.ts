import { Request, Response } from "express";
import UserModel from "../model/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { tryError, catchError } from "../utils/errorHandler";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw tryError("Email and password are required", 400);
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      throw tryError("Invalid credentials", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw tryError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 din
    });

    // success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } 
  catch (error) {
    catchError(error, res, "Internal Server Error");
  }
};


export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, mobile, password, role } = req.body;

        // 1. Basic Validation
        if (!name || !email || !password || !mobile) {
            throw tryError("Please provide all required fields.", 400)
        }

        // 2. Check if User already exists
        const existingUser = await UserModel.findOne({ 
            $or: [{ email }, { mobile }] 
        });

        if (existingUser) {
            throw tryError("User with this email or mobile already exists.", 400)
        }

        // 3. Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const newUser = await UserModel.create({
            name,
            email,
            mobile,
            password: hashedPassword,
            role: role || "USER"
        });
        console.log(newUser);

        // 5. Success Response
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } 
    catch (error) {
        catchError(error, res, "Internal Server Error");
    }
};