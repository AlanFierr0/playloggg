import type { Database } from "./database";

type Functions = Database["public"]["Functions"];
type SaveCuratedList = Functions["save_curated_list"];

// The SQL function accepts null IDs/revisions when creating a list. Supabase's
// generator does not represent argument nullability; keep this override separate
// so database.ts can be regenerated without losing the function's actual contract.
export type AppDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Functions"> & {
    Functions: Omit<Functions, "save_curated_list"> & {
      save_curated_list: Omit<SaveCuratedList, "Args"> & {
        Args: Omit<SaveCuratedList["Args"], "p_list_id" | "p_expected_revision"> & {
          p_list_id: number | null;
          p_expected_revision: number | null;
        };
      };
    };
  };
};
