import "server-only";
import {createHash} from "node:crypto";
import {createAuthAdmin} from "@/lib/supabase/auth-admin";
import {checkOperationLimit} from "@/lib/operation-limits";
import {reviewParts,hasReviewProse} from "@/lib/review-text";
export type ReviewTranslation={text:string;sourceLanguage:string};
export async function translateReview(text:string,target:"EN"|"ES"):Promise<ReviewTranslation|null>{
 const key=process.env.DEEPL_API_KEY;
 if(!key||text.length>20000||!hasReviewProse(text))return null;
 const parts=reviewParts(text),indexes=parts.flatMap((part,index)=>!/^https?:\/\//.test(part)&&part.trim()?[index]:[]);
 if(indexes.length>50)return null;
 const endpoint=key.endsWith(":fx")?"https://api-free.deepl.com/v2/translate":"https://api.deepl.com/v2/translate";
 const response=await fetch(endpoint,{method:"POST",headers:{Authorization:`DeepL-Auth-Key ${key}`,"Content-Type":"application/json"},body:JSON.stringify({text:indexes.map(index=>parts[index].trim()),target_lang:target==="EN"?"EN-US":"ES",preserve_formatting:true}),signal:AbortSignal.timeout(10000),cache:"no-store"});
 if(!response.ok)throw new Error("Translation unavailable");
 const data=await response.json();
 if(!Array.isArray(data.translations)||data.translations.length!==indexes.length||data.translations.some((row:{text?:unknown;detected_source_language?:unknown})=>typeof row.text!=="string"||typeof row.detected_source_language!=="string"||!/^[A-Z-]{2,10}$/.test(row.detected_source_language)))throw new Error("Translation unavailable");
 indexes.forEach((index,at)=>{const original=parts[index];parts[index]=(original.match(/^\s*/)?.[0]??"")+data.translations[at].text+(original.match(/\s*$/)?.[0]??"");});
 const result={text:parts.join(""),sourceLanguage:data.translations.find((row:{detected_source_language:string})=>row.detected_source_language!==target)?.detected_source_language??target};
 if(result.text.length>40000)throw new Error("Translation unavailable");
 return result;
}
const inFlight=new Map<string,Promise<ReviewTranslation|null>>();
export function getReviewTranslation(profileId:number,gameId:number,text:string,target:"EN"|"ES"){
 const hash=createHash("sha256").update(text).digest("hex"),identity=`${profileId}:${gameId}:${target}:${hash}`;
 const pending=inFlight.get(identity);if(pending)return pending;
 const promise=(async()=>{
  if(!hasReviewProse(text)||text.length>20000)return null;
  const admin=createAuthAdmin(),args={p_profile_id:profileId,p_game_id:gameId,p_hash:hash,p_target:target};
  const cached=await admin.rpc("read_review_translation",args);if(cached.error)throw new Error("Translation unavailable");
  if(cached.data&&typeof cached.data==="object"&&!Array.isArray(cached.data)&&typeof cached.data.text==="string"&&typeof cached.data.sourceLanguage==="string")return {text:cached.data.text,sourceLanguage:cached.data.sourceLanguage};
  if(!process.env.DEEPL_API_KEY)return null;
  await checkOperationLimit("review-translation","translation");
  // shortcut: cap new translations at 500,000 monthly source characters; revisit when legitimate demand exceeds it.
  const reserved=await admin.rpc("reserve_review_translation",{p_characters:text.length});if(reserved.error||!reserved.data)return null;
  const result=await translateReview(text,target);if(!result)return null;
  const saved=await admin.rpc("store_review_translation",{...args,p_original:text,p_translation:result.text,p_source_language:result.sourceLanguage});
  if(saved.error||!saved.data)return null;
  return result;
 })().finally(()=>inFlight.delete(identity));
 inFlight.set(identity,promise);return promise;
}
