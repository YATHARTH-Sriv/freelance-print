import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/User";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Connect to the database
        await dbconnect();

        // Check if the user already exists in the database
        const existingUser = await UserModel.findOne({ email: user.email });

        if (!existingUser) {
          // Create a new user if it doesn't exist
          await UserModel.create({
            email: user.email,
            name: user.name || "No Name Provided", // Fallback if name is missing
            image: user.image,
            files: [], // Initialize files as an empty array
          });
          console.log("New user created in the database.");
        } else {
          console.log("User already exists in the database.");
        }

        console.log("User signed in successfully.");
        return true;
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false; // Return false if there is an error
      }
    },
  },
};

