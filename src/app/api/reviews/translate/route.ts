import {getAccount} from "@/lib/owner";
import {getCatalogGame} from "@/lib/portfolio";
import {createPublicClient} from "@/lib/supabase/public";
import {getReviewTranslation} from "@/lib/review-translation";
export async function GET(request:Request){
 const headers={"Cache-Control":"private, no-store"},query=new URL(request.url).searchParams;
 const id=Number(query.get("profile")),slug=query.get("game")??"",language=query.get("language");
 if(!Number.isSafeInteger(id)||id<1||!["en","es-AR"].includes(language??""))return Response.json({translation:null},{status:400,headers});
 try{
  const [account,game]=await Promise.all([getAccount(),getCatalogGame(slug)]);
  if(!game)return Response.json({translation:null},{status:404,headers});
  const client=account?.supabase??createPublicClient();
  const read=()=>client.from("ratings").select("review").eq("profile_id",id).eq("game_id",game.id).maybeSingle();
  const {data:rating,error}=await read();
  if(error||!rating?.review)return Response.json({translation:null},{status:404,headers});
  const translation=await getReviewTranslation(id,game.id,rating.review,language==="es-AR"?"ES":"EN");
  const current=await read();
  if(current.error||current.data?.review!==rating.review)return Response.json({translation:null},{status:404,headers});
  return Response.json({translation},{headers});
 }catch{return Response.json({translation:null},{headers});}
}
