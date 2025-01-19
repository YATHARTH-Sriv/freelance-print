import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import FileModel from "@/models/File";
import UserModel from "@/models/User";
import mongoose from "mongoose";
import dbconnect from "@/lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbconnect();

    // Get the request body
    const { url, filename, fileType } = await request.json();

    // Validate required fields
    if (!url || !filename || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the current user
    const user = await UserModel.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create new file document
    const newFile = new FileModel({
      userId: user._id,
      url,
      filename,
      fileType,
      status: 'pending',
      uploadDate: new Date()
    });

    // Save the file
    const savedFile = await newFile.save();

    // Add file reference to user's files array
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $push: { files: savedFile._id }
      },
      { new: true }
    );

    return NextResponse.json({
      message: "File uploaded successfully",
      file: savedFile
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/files:", error);
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: "Database error occurred" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}