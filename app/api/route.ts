import { BN, Program } from "@coral-xyz/anchor";
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { Voting } from "@/../anchor/target/types/voting";
const IDL = require('@/../anchor/target/idl/voting.json');
export async function GET(req: Request) {
    try {
        const actionMetdata: ActionGetResponse = {
            icon: "https://zestfulkitchen.com/wp-content/uploads/2021/09/Peanut-butter_hero_for-web-2.jpg",
            title: "Vote for your favorite type of peanut butter!",
            description: "Vote between crunchy and smooth peanut butter.",
            label: "Vote",
            links: {
                actions: [
                    {
                        type: "post",
                        label: "Vote for Crunchy",
                        href: "/api/vote?candidate=Crunchy",
                    },
                    {
                        type: "post",
                        label: "Vote for Smooth",
                        href: "/api/vote?candidate=Smooth",
                    }
                ]
            }
        };
        return Response.json(actionMetdata, { headers: ACTIONS_CORS_HEADERS });
    } catch (error) {
        console.log({ error });

        return NextResponse.json({ error }, { status: 500 });
    }
}



export async function POST(request: Request) {
    const url = new URL(request.url);
    console.log("Request Url : ", url)
    const candidate = url.searchParams.get("candidate");
    console.log("Selected Candidate :", candidate)

    if (candidate != "Crunchy" && candidate != "Smooth") {
        return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const program: Program<Voting> = new Program(IDL, { connection });

    const body: ActionPostRequest = await request.json();
    console.log("Body of ActionPostRequest", body)
    let voter;

    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const instruction = await program.methods
        .vote(candidate, new BN(1))
        .accounts({
            signer: voter,
        })
        .instruction();

    const blockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction);

    const response = await createPostResponse({
        fields: {
            type: "transaction",
            transaction: transaction
        }
    });

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });

}