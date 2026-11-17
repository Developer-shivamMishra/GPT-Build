"use server";

import { currentUser } from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import  type { User } from "@clerk/nextjs/server";


export async function onboarUser() {
   
    const clerkUser = await currentUser();

    if (!clerkUser) {
        throw new Error("unauthorized");
    }

    const  email = clerkUser.emailAddresses[0].emailAddress?? null;

    return  prisma.user.upsert({
        where:{clerkId: clerkUser.id},
        create: {
            clerkId: clerkUser.id,
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
        update: {
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
    });
}