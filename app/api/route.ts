import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        // const searchParams = req.nextUrl.searchParams;
        // const userId = searchParams.get("userId");

              return NextResponse.json(
            {
               message :"Hello Nishant!"
            },
            { status: 200 }
        );
    } catch (error) {
        console.log({ error });

        return NextResponse.json({ error }, { status: 500 });
    }
}