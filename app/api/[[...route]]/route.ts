import { Hono } from "hono";
import { handle } from "hono/vercel";
import  accounts  from "./accounts";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app.route("/accounts",accounts);

export const GET = handle(app);
export const POST = handle(app);

export type AppType  = typeof routes; // enable rpc, rcp help in end to end type safety , it will be useful when we combine with it react-query

//for line number 11
// export const GET=()=>{
//     return NextResponse.json({
//         message:"Hi",
//     });
// } 
// instead of writing this we write handle(app) function on line 11

// api routes using nextjs 

// export const GET =(request:NextResponse,
//     {params}: {params:{testId:string}},
// )=>{
//     return NextResponse.json({
//         hello:"world",
//         testId:params.testId,
//     })
// }


