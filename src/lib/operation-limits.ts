import "server-only";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";

export const operationLimits = {
 metadata: [120, 1500], search: [30, 600], import: [120, 1500], steam: [120, 1500], avatar: [6, 30], translation: [60, 500],
} as const;
export async function checkOperationLimit(actor: string, operation: keyof typeof operationLimits) {
  const admin = createAuthAdmin();
  const limits = operationLimits[operation];
  for (const [index, seconds] of [60, 86400].entries()) {
    const {data,error} = await admin.rpc("consume_operation_limit", {p_actor:actor,p_operation:operation,p_seconds:seconds,p_limit:limits[index]});
    if(error || typeof data !== "number") throw new Error("Usage limits could not be checked. Please retry.");
    if(data>0) throw new Error(`Too many requests. Try again in ${data} seconds.`);
  }
}
export function operationFailure(error: unknown, fallback: string) {
  return error instanceof Error && (/^Too many requests\. Try again in \d+ seconds\.$/.test(error.message) || error.message === "Usage limits could not be checked. Please retry.") ? error.message : fallback;
}

// Each missing catalog game still consumes one unit in both existing quota windows.
export async function reserveImportQuota(actor:string,count:number) {
  if(!Number.isSafeInteger(count)||count<1||count>25)throw new Error("Usage limits could not be checked. Please retry.");
  const {data,error}=await createAuthAdmin().rpc("consume_operation_limit_batch",{p_actor:actor,p_operation:"import",p_count:count,p_minute_limit:operationLimits.import[0],p_daily_limit:operationLimits.import[1]});
  const result=data?.[0];
  if(error||data?.length!==1||!result||!Number.isSafeInteger(result.allowed_count)||result.allowed_count<0||result.allowed_count>count||!Number.isSafeInteger(result.retry_after)||result.retry_after<0||(result.allowed_count===count)!==(result.retry_after===0))
    throw new Error("Usage limits could not be checked. Please retry.");
  return {allowed:result.allowed_count,message:result.retry_after ? `Too many requests. Try again in ${result.retry_after} seconds.` : ""};
}
