"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {useMessages} from "@/components/site-preferences";
import {ProfileAvatar} from "@/components/profile-avatar";
import {ReviewText} from "@/components/review-text";
import {ReviewHelpfulness} from "@/components/review-helpfulness";
import type {GameReviewPage} from "@/lib/game-reviews";
export function GameReviews({slug,initial}:{slug:string;initial:GameReviewPage}){
 const t=useMessages(),[data,setData]=useState(initial),[pending,setPending]=useState(false),[failed,setFailed]=useState(false);
 const request=useRef<AbortController|null>(null),offset=useRef(initial.reviews.length);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function loadMore(){
  if(pending)return;
  const controller=new AbortController();request.current=controller;setPending(true);setFailed(false);
  try{
   const response=await fetch(`/api/games/${encodeURIComponent(slug)}/reviews?offset=${offset.current}`,{signal:controller.signal,cache:"no-store"});
   if(!response.ok)throw new Error("Reviews unavailable");
   const next:GameReviewPage=await response.json();
   if(controller.signal.aborted)return;
   offset.current+=next.reviews.length;
   setData(current=>({...next,reviews:[...new Map([...current.reviews,...next.reviews].map(review=>[review.profile_id,review])).values()]}));
  }catch{if(!controller.signal.aborted)setFailed(true);}
  finally{if(!controller.signal.aborted)setPending(false);}
 }
 return <section aria-labelledby="community-reviews-title" className="space-y-5">
  <div><h2 id="community-reviews-title" className="font-headline-lg text-headline-lg font-bold">{t("Community reviews")}</h2><p className="mt-2 text-body-sm text-on-surface-variant">{t("Most helpful first")}</p></div>
  {!data.reviews.length&&<p className="text-on-surface-variant">{t("No community reviews yet.")}</p>}
  <div className="space-y-4">{data.reviews.map(review=><article key={review.profile_id} data-community-review={review.handle} className="rounded-xl bg-surface-container-low p-5 sm:p-6 space-y-4">
   <header className="flex flex-wrap items-center gap-3">
    <Link href={`/u/${review.handle}`} className="flex min-w-0 flex-1 items-center gap-3 hover:text-primary"><ProfileAvatar name={review.display_name} src={review.avatar_url} className="h-10 w-10 rounded-lg"/><span translate="no" className="font-semibold break-words">{review.display_name}</span></Link>
    <span className="font-semibold tabular-nums text-primary">{review.score===null?t("Unrated"):`${review.score} / 100`}</span>
   </header>
   <ReviewText text={review.review} slug={slug} profileId={String(review.profile_id)}/>
   <ReviewHelpfulness slug={slug} profileId={String(review.profile_id)} data={{signedIn:data.viewerId!==null,canVote:data.viewerId!==null&&data.viewerId!==review.profile_id,reviews:{[slug]:{upvotes:review.upvotes,downvotes:review.downvotes,vote:review.viewer_vote}}}}/>
  </article>)}</div>
  {failed&&<p role="alert" className="text-error">{t("Community reviews could not be loaded.")}</p>}
  {data.hasMore&&<button type="button" disabled={pending} onClick={loadMore} className="min-h-11 rounded-lg bg-surface-container px-4 text-primary disabled:opacity-50">{t(pending?"Loading…":failed?"Try again.":"Load more")}</button>}
 </section>;
}
