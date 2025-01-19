
"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import React from 'react';

function page() {

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-primary">Welcome to SmartPrint</CardTitle>
          <CardDescription className="text-center text-lg">
            Login to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Button variant="outline" className="h-12 gap-2" onClick={() => signIn("google",{callbackUrl:"/upload"})}>Login with Google
            <FcGoogle className="mr-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default page