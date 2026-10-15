import {getGameReviews} from "@/lib/game-reviews";
import {getMessages} from "@/lib/locale/server";
import {GameReviews} from "@/components/game-reviews";
export async function CommunityGameReviews({slug}:{slug:string}){
 const [data,t]=await Promise.all([getGameReviews(slug).catch(()=>null),getMessages()]);
 return data?<GameReviews slug={slug} initial={data}/>:<p role="status" className="text-on-surface-variant">{t("Community reviews could not be loaded.")}</p>;
}
