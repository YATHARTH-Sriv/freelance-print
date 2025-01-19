'use client';

import { useState } from 'react';
import { MultiFileDropzone, type FileState } from '@/components/MultiFileDropzone';
import { useEdgeStore } from '@/lib/edgestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowUp, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { signOut, useSession } from 'next-auth/react';

// Hardcoded user data

export default function UploadPage() {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const router = useRouter();
  const {data:session}=useSession()
  const { edgestore } = useEdgeStore();

  function updateFileProgress(key: string, progress: FileState['progress']) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key,
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  const handleUpload = async () => {
    try {
      const completedFiles = fileStates.filter(
        (fileState) => fileState.progress === 'COMPLETE'
      );
      
      const uploadPromises = completedFiles.map(async (fileState) => {
        await fetch('/api/files', {
          method: 'POST',
          body: JSON.stringify({
            url: fileState.url,
            filename: fileState.file.name,
            fileType: fileState.file.type,
          }),
        });
      });

      await Promise.all(uploadPromises);
      router.push('/checkout');
    } catch (error) {
      console.error('Failed to save file info:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground bg-black">
      <main className="flex-1 overflow-auto p-4">
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <h1 className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-4xl font-bold tracking-tight text-transparent text-center">
            Get started with Smart Print
          </h1>
          
          <div className="w-full max-w-2xl">
            <MultiFileDropzone
              value={fileStates}
              onChange={(files) => {
                setFileStates(files);
              }}
              onFilesAdded={async (addedFiles) => {
                setFileStates([...fileStates, ...addedFiles]);
                await Promise.all(
                  addedFiles.map(async (addedFileState) => {
                    try {
                      const res = await edgestore.publicFiles.upload({
                        file: addedFileState.file,
                        onProgressChange: async (progress) => {
                          updateFileProgress(addedFileState.key, progress);
                          if (progress === 100) {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            updateFileProgress(addedFileState.key, 'COMPLETE');
                          }
                        },
                      });
                      setFileStates((prevStates) => {
                        const newStates = structuredClone(prevStates);
                        const fileState = newStates.find(
                          (state) => state.key === addedFileState.key
                        );
                        if (fileState) {
                          fileState.url = res.url;
                        }
                        return newStates;
                      });
                    } catch (err) {
                      updateFileProgress(addedFileState.key, 'ERROR');
                    }
                  }),
                );
              }}
              className="border-2 border-dashed border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            />
          </div>

          {fileStates.length > 0 && (
            <div className="w-full max-w-2xl space-y-2">
              {fileStates.map((file) => (
                <div key={file.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{file.file.name}</span>
                    <span>{file.progress === 'COMPLETE' ? 'Completed' : `${file.progress}%`}</span>
                  </div>
                  {/* <Progress value={file.progress === 'COMPLETE' ? 100 : file.progress} className="h-1" /> */}
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!fileStates.some((file) => file.progress === 'COMPLETE')}
            className="mt-4"
          >
            <ArrowUp className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </main>

      <div className=" bg-black text-white p-4 ">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center space-x-4">
           { session && session.user && session.user.image && session.user.email &&  <Avatar>
              <AvatarImage src={session?.user?.image} alt={session?.user?.email} />
              {/* <AvatarFallback>{session?.user?.email[0].toUpperCase()}</AvatarFallback> */}
            </Avatar>}
            <span className="text-sm font-medium">{session?.user?.email}</span>
          </div>
          <Button onClick={()=>signOut({callbackUrl:"/"})} variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

