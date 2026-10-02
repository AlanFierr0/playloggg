-- Expand played platforms without rewriting existing PC / Steam values or access policies.
alter table public.ratings drop constraint ratings_platform_check;
alter table public.ratings add constraint ratings_platform_check
 check (platform in ('pc','pc_battlenet','pc_gog','pc_epic','pc_ea','pc_ubisoft','pc_xbox','pc_other','ps5','xbox_series_x','steam_deck'));