"use server";

import { db } from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";

export const isUserLoggedIn = async () => {
  try {
    const { userId } = await auth();
    console.log(userId);
    if (!userId) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};
