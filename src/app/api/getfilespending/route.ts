// api/getfilespending.ts
import dbconnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import UserModel from '@/models/User';
import FileModel from '@/models/File';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import axios from 'axios';

// Helper function to download and save file
async function downloadFile(url: string, filename: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const tempPath = path.join(process.cwd(), 'public', 'temp', filename);
  await writeFile(tempPath, response.data);
  return `/temp/${filename}`;
}

// Helper function to clean up temporary files
async function cleanupTempFiles(files: string[]) {
  for (const file of files) {
    const filePath = path.join(process.cwd(), 'public', file);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error);
    }
  }
}

export async function GET() {
  await dbconnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await UserModel.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const allfiles = await FileModel.find({
    userId: user._id,
    status: 'pending'
  });

  // Download and save files locally
  const processedFiles = await Promise.all(
    allfiles.map(async (file) => {
      try {
        const localPath = await downloadFile(file.url, `${file._id}-${file.filename}`);
        return {
          ...file.toObject(),
          localUrl: localPath
        };
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
        return file.toObject();
      }
    })
  );

  return NextResponse.json(processedFiles);
}

export async function POST(req: Request) {
  await dbconnect();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const user = await UserModel.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get all pending files to clean up their temp files
  const pendingFiles = await FileModel.find({
    userId: user._id,
    status: 'pending'
  });

  // Clean up temporary files
  const tempFiles = pendingFiles.map(file => `/temp/${file._id}-${file.filename}`);
  await cleanupTempFiles(tempFiles);

  // Update file status
  await FileModel.updateMany(
    { userId: user._id, status: 'pending' },
    { $set: { status: 'completed' } }
  );

  return NextResponse.json({ message: "All files are completed" }, { status: 200 });
}