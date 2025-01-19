import dbconnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../auth/[...nextauth]/options';
import UserModel from '@/models/User';
import FileModel from '@/models/File';


export async function GET() {
    await dbconnect()
  const session=await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  const user=await UserModel.findOne({ email: session.user.email });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
  const allfiles = await FileModel.find({
    userId: user._id,
    status: 'pending'
  });
  return NextResponse.json(allfiles);
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
    await FileModel.updateMany(
        { userId: user._id, status: 'pending' },
        { $set: { status: 'completed' } }
    );
    
    return NextResponse.json({ message: "All files are completed" },{status:200});
    
}
