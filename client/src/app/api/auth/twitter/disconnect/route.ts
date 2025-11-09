import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const session = await auth();

    if (!session?.user) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const delAccount = await prisma.user.update({
        where: { id: session.user.id },
        data: {
        accounts:{
            deleteMany:{
                provider: "twitter",
            }
        }    
        },
    });

    return NextResponse.json({ message: "Twitter account disconnected successfully." });
}