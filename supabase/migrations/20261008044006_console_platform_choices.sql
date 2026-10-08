-- Add console choices without changing existing entries or ownership policies.
alter table public.ratings drop constraint ratings_platform_check;
alter table public.ratings add constraint ratings_platform_check
 check (platform in ('pc','pc_battlenet','pc_gog','pc_epic','pc_ea','pc_ubisoft','pc_xbox','pc_other','ps1','ps2','ps3','ps4','ps5','psp','ps_vita','xbox','xbox_360','xbox_one','xbox_series_x','xbox_series_s','steam_deck'));
