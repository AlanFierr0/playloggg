import {getAccount} from "@/lib/owner";
import {getPortfolio} from "@/lib/portfolio";
import {portfolioExport,portfolioCsv} from "@/lib/portfolio-export";
export async function GET(request:Request){
 const headers={"Cache-Control":"private, no-store","Pragma":"no-cache"};
 const format=new URL(request.url).searchParams.get("format")??"json";
 if(!["json","csv"].includes(format))return Response.json({error:"Invalid format."},{status:400,headers});
 try{
  const account=await getAccount();
  if(!account?.profile)return Response.json({error:"Sign in to export your data."},{status:401,headers});
  const data=portfolioExport(await getPortfolio());
  const filename=`playlogg-${account.profile.handle}-${data.exportedAt.slice(0,10)}.${format}`;
  return new Response(format==="csv"?portfolioCsv(data):JSON.stringify(data,null,2),{headers:{...headers,"Content-Type":format==="csv"?"text/csv; charset=utf-8":"application/json; charset=utf-8","Content-Disposition":`attachment; filename="${filename}"`}});
 }catch{return Response.json({error:"Your data could not be exported. Please retry."},{status:503,headers});}
}
