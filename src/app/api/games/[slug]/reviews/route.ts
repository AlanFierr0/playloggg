import {getGameReviews} from "@/lib/game-reviews";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const headers={"Cache-Control":"private, no-store"};
 const raw=new URL(request.url).searchParams.get("offset")??"0",offset=Number(raw);
 if(!/^\d{1,5}$/.test(raw)||offset>10000||offset%24!==0)return Response.json({error:"Invalid page."},{status:400,headers});
 try{
  const data=await getGameReviews((await params).slug,offset);
  return data?Response.json(data,{headers}):Response.json({error:"Game unavailable."},{status:404,headers});
 }catch{return Response.json({error:"Community reviews could not be loaded."},{status:503,headers});}
}
