import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {

    try {

        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
        }

        const body = await req.json();
        const { reportId, companyName, riskScore } = body;

    let status = "Safe";
    if (riskScore > 60) {
      status = "Toxic";
    } else if (riskScore > 40) {
      status = "Suspicious";
    }

        // We use upsert so if a user refreshes the page, it doesn't crash the database with a duplicate ID error
        const savedScan = await prisma.scanReport.upsert({
            where: { reportId: reportId },
            update: {},  // Do nothing if it already exists
            create: {
                reportId,
                companyName,
                riskScore,
                status,
                userId: session.user.id, // Associate the report with the logged-in user
            },
        });

        return NextResponse.json(savedScan, { status: 201 });


    } catch (error) {
        console.error("Database Save Error:", error);
        return NextResponse.json({ error: "Failed to save intelligence report" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userScans = await prisma.scanReport.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(userScans, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch history:", error);
        return NextResponse.json({ error: "Failed to load scan history" }, { status: 500 });
    }
}