"use client";
import {useEffect,useRef,useState} from "react";
import {usePortfolio} from "@/components/portfolio-provider";
import {useSitePreferences,useMessages} from "@/components/site-preferences";
import {hasReviewProse,reviewParts} from "@/lib/review-text";
export function ReviewText({text,slug,profileId,className=""}:{text:string;slug:string;profileId?:string;className?:string}){
 const {profile}=usePortfolio(),{locale}=useSitePreferences(),t=useMessages(),element=useRef<HTMLDivElement>(null);
 const selected=profileId??profile.id,key=`${locale}:${text}`;
 const [translation,setTranslation]=useState<{key:string;text:string}|null>(null),[original,setOriginal]=useState<string|null>(null);
 useEffect(()=>{
  if(!selected||!hasReviewProse(text))return;
  const controller=new AbortController();let started=false;
  async function translate(){
   if(started)return;started=true;
   try{
    const response=await fetch(`/api/reviews/translate?${new URLSearchParams({profile:selected,game:slug,language:locale})}`,{signal:controller.signal,cache:"no-store"});
    if(!response.ok)return;
    const {translation:value}=await response.json();
    if(!controller.signal.aborted&&typeof value?.text==="string"&&value.sourceLanguage!==(locale==="en"?"EN":"ES"))setTranslation({key,text:value.text});
   }catch{}
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer?.disconnect();void translate();}},{rootMargin:"200px"}):null;
  if(observer&&element.current)observer.observe(element.current);else void translate();
  return ()=>{controller.abort();observer?.disconnect();};
 },[key,locale,selected,slug,text]);
 const translated=translation?.key===key,showOriginal=original===key,display=translated&&!showOriginal?translation!.text:text;
 return <div ref={element} className="space-y-2">
  <p translate="no" className={`whitespace-pre-wrap break-words text-on-surface-variant ${className}`}>{reviewParts(display).map((part,index)=>/^https?:\/\//.test(part)?<a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:no-underline">{part}</a>:part)}</p>
  {translated&&<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-on-surface-variant"><span>{t(showOriginal?"Original review":"Automatically translated with DeepL")}</span><button type="button" className="min-h-11 text-primary hover:underline" onClick={()=>setOriginal(showOriginal?null:key)}>{t(showOriginal?"Show translation":"Show original")}</button></div>}
 </div>;
}
