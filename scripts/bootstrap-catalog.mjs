// Authorized production catalog expansion to 3,000 released main games. No profiles/ratings are touched.
// Production builds resume idempotently; local/preview builds never run this import.
import { createClient } from '@supabase/supabase-js';
import { createIgdbClient } from './igdb-client.mjs';
import { normalizeImport } from '../src/lib/catalog-input.ts';

export const bootstrapFields = 'id,name,slug,total_rating_count,first_release_date,cover.image_id,genres.name,platforms.name,artworks.image_id,screenshots.image_id,url,summary,game_type.type,involved_companies.company.name,involved_companies.developer,involved_companies.publisher';
export function bootstrapQuery(offset, now = Math.floor(Date.now()/1000)) {
  if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('Invalid catalog offset.');
  return `fields ${bootstrapFields}; where first_release_date > 0 & first_release_date <= ${now} & cover != null & version_parent = null & game_type.type = "Main Game" & total_rating_count >= 10; sort total_rating_count desc; limit 500; offset ${offset};`;
}
export async function bootstrapCatalog({admin, query, target = 3000, progress = console.log}) {
  const {count, error} = await admin.from('games').select('id',{count:'exact',head:true});
  if (error || count === null) throw new Error('Catalog count could not be checked.');
  if (count >= target) {progress(`Catalog bootstrap complete: ${count} games already stored.`); return count;}
  let total = count;
  // Bounded scan and idempotent batches; duplicate IDs keep existing reviewed rows.
  for (let offset = 0; offset < 5000 && total < target; offset += 500) {
    const records = await query(bootstrapQuery(offset));
    if (!records.length) break;
    const candidates = records.map(normalizeImport).filter(Boolean);
    if (!candidates.length) continue;
    const {data: existing,error: readError} = await admin.from('games').select('igdb_id').in('igdb_id',candidates.map(g => g.igdb_id));
    if (readError) throw new Error('Existing catalog IDs could not be checked.');
    const ids = new Set(existing.map(g => g.igdb_id));
    const batch = candidates.filter(g => !ids.has(g.igdb_id) && ids.add(g.igdb_id)).slice(0,target-total);
    if (batch.length) {
      progress(`Catalog batch: ${batch.length} released main games; sample: ${batch.slice(0,5).map(game => game.title).join(" · ")}`);
      const {error: writeError} = await admin.from('games').upsert(batch,{onConflict:'igdb_id',ignoreDuplicates:true});
      if (writeError) throw new Error('Catalog bootstrap batch could not be stored. Existing records were preserved.');
    }
    const {count: current,error: countError} = await admin.from('games').select('id',{count:'exact',head:true});
    if (countError || current === null) throw new Error('Catalog progress could not be checked.');
    total = current;
    progress(`Catalog bootstrap: ${total}/${target} games stored.`);
  }
  if (total < target) throw new Error(`Catalog bootstrap stopped at ${total}/${target}; retry to resume.`);
  return total;
}

if (process.argv[1]?.replaceAll('\\','/').endsWith('/bootstrap-catalog.mjs')) {
  if (process.env.VERCEL_ENV !== 'production') console.log('Catalog bootstrap skipped outside Vercel Production.');
  else {
    const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SECRET_KEY:key} = process.env;
    if (!url || !key) throw new Error('Configure server-only catalog credentials in Vercel Production.');
    const admin = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init) => fetch(input,{...init,signal:AbortSignal.timeout(30000)})}});
    await bootstrapCatalog({admin,query:createIgdbClient()});
  }
}
