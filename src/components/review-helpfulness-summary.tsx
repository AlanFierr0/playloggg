import { getReviewHelpfulness } from "@/lib/review-helpfulness";
import { ReviewHelpfulness } from "@/components/review-helpfulness";

export async function ReviewHelpfulnessSummary({ profileId, slug }: { profileId: number; slug: string }) {
  const data = await getReviewHelpfulness(profileId);
  return <ReviewHelpfulness profileId={String(profileId)} slug={slug} data={data} />;
}
