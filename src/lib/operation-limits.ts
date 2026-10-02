import "server-only";
import { createAuthAdmin } from "@/lib/supabase/auth-admin";

export const operationLimits = {
 search: [30, 600], import: [120, 1500], steam: [120, 1500], avatar: [6, 30],
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
