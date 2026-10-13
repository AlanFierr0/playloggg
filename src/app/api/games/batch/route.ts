import {getCatalogPage} from "@/lib/catalog-page";
import {parseGamesQuery} from "@/lib/games-query";
export async function GET(request:Request){
  const headers={"Cache-Control":"private, no-store"};
  try {
    const {filters,page}=parseGamesQuery(new URL(request.url).searchParams);
    const {data}=await getCatalogPage(filters,page,true);
    return Response.json(data,{headers});
  }catch{return Response.json({error:"The game catalog could not be loaded."},{status:503,headers});}
}
