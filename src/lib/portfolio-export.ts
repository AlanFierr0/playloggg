import type {Portfolio} from "../types/domain.ts";
export function portfolioExport(portfolio:Portfolio,exportedAt=new Date().toISOString()){
 const source=portfolio.profile;
 const profile={handle:source.handle,displayName:source.displayName,bio:source.bio??null,location:source.location??null,platformPreference:source.platformPreference??null,avatarUrl:source.avatarUrl??null,isPublic:source.isPublic,isDiscoverable:source.isDiscoverable,tierRanges:source.tierRanges};
 const logs=portfolio.games.filter(game=>game.logged).map(game=>({slug:game.slug,title:game.title,score:game.score,tier:game.tier??null,tierManual:game.tierManual??false,status:game.status??null,playStyle:game.playStyle??null,platform:game.platform??null,hoursPlayed:game.hoursPlayed??null,completedOn:game.completedOn??null,review:game.review??null,tags:game.tags??[],updatedAt:game.updatedAt??null,reviewUpdatedAt:game.reviewUpdatedAt??null}));
 return {schemaVersion:1,exportedAt,profile,logs,favorites:portfolio.favorites??[],ranking:{slugs:portfolio.ranking?.slugs??logs.map(log=>log.slug),manualPositions:portfolio.ranking?.manualPositions??{}}};
}
export function portfolioCsv(data:ReturnType<typeof portfolioExport>){
 const rows:Record<string,unknown>[]=[{record_type:"profile",data:JSON.stringify(data.profile)}];
 for(const [tier,range] of Object.entries(data.profile.tierRanges??{}))rows.push({record_type:"range",tier,minimum:range[0],maximum:range[1]});
 for(const log of data.logs)rows.push({record_type:"log",...log,tags:JSON.stringify(log.tags)});
 for(const favorite of data.favorites)rows.push({record_type:"favorite",...favorite});
 data.ranking.slugs.forEach((slug,position)=>rows.push({record_type:"ranking",slug,position,manualPosition:data.ranking.manualPositions[slug]??null}));
 const headers=[...new Set(rows.flatMap(row=>Object.keys(row)))];
 const cell=(value:unknown)=>{
  let text=value===undefined||value===null?"":String(value);
  if(typeof value==="string"&&/^\s*[=+@-]/.test(text))text="'"+text;
  return '"'+text.replaceAll('"','""')+'"';
 };
 return "\uFEFF"+[headers.map(cell).join(","),...rows.map(row=>headers.map(key=>cell(row[key])).join(","))].join("\r\n");
}
