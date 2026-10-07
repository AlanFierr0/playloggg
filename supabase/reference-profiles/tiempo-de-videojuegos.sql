-- Database-managed reference; no Auth account is created or assigned.
begin;
insert into public.profiles(handle,display_name,is_public,is_discoverable,owner_user_id,bio)
values ('tiempo_de_videojuegos','Tiempo de Videojuegos',true,false,null,'Independently maintained reference profile, not an official account. Scores are sourced from Tiempo de Videojuegos videos via EmilioRankings. YouTube: https://www.youtube.com/@TiempodeVideojuegos | Archive: https://emiliorankings.com/')
on conflict(handle) do nothing;
do $$ begin
  if not exists(select 1 from public.profiles where handle='tiempo_de_videojuegos' and owner_user_id is null and is_public)
  then raise exception 'Expected unowned public reference profile'; end if;
end $$;
insert into public.ratings(profile_id,game_id,score,review)
select p.id,g.id,v.score,v.review from (values
('007-first-light-igdb-141114', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1960s
Archive: https://emiliorankings.com/'),
('a-plague-tale-innocence-igdb-27316', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=NkV48ty3MzY&t=3839s
Archive: https://emiliorankings.com/'),
('a-plague-tale-requiem-igdb-152242', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2580s
Archive: https://emiliorankings.com/'),
('alan-wake-igdb-1062', 81, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80 - 81. Stored score: 81/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=320s
https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9515s
Archive: https://emiliorankings.com/'),
('astral-chain-igdb-115283', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2638s
Archive: https://emiliorankings.com/'),
('astro-bot-igdb-303811', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 90. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2419s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5034s
Archive: https://emiliorankings.com/'),
('batman-arkham-asylum-igdb-500', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=7382s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=5733s
Archive: https://emiliorankings.com/'),
('batman-arkham-city-igdb-501', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=6017s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=64s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=200qyWFEg20&t=4605s
https://www.youtube.com/watch?v=gA3I2-cR1b0&t=1349s
Archive: https://emiliorankings.com/'),
('batman-arkham-knight-igdb-5503', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1250s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1435s
Archive: https://emiliorankings.com/'),
('batman-arkham-origins-igdb-2003', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 86. Stored score: 86/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s
https://www.youtube.com/watch?v=gA3I2-cR1b0&t=1307s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=9917s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5544s
Archive: https://emiliorankings.com/'),
('batman-the-video-game-2-igdb-49226', 55, 'Independently maintained reference rating from EmilioRankings.
Archived score: 50 - 60. Stored score: 55/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=V3N7lLj3M6g&t=2088s
Archive: https://emiliorankings.com/'),
('bayonetta-igdb-2136', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2557s
Archive: https://emiliorankings.com/'),
('bayonetta-2-igdb-2135', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s
Archive: https://emiliorankings.com/'),
('bayonetta-3-igdb-76888', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s
Archive: https://emiliorankings.com/'),
('bioshock-igdb-20', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=98s
https://www.youtube.com/watch?v=0X88m94CzdA&t=10081s
Archive: https://emiliorankings.com/'),
('bioshock-infinite-igdb-538', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1685s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=194s
Archive: https://emiliorankings.com/'),
('black-igdb-5749', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2516s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=4475s
https://www.youtube.com/watch?v=7M46OAGpDDc&t=11384s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=9283s
Archive: https://emiliorankings.com/'),
('bloodborne', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=743s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s
Archive: https://emiliorankings.com/'),
('call-of-duty-4-modern-warfare-igdb-623', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=6boalDhb1NE&t=1268s
Archive: https://emiliorankings.com/'),
('call-of-duty-black-ops-igdb-545', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=96s
Archive: https://emiliorankings.com/'),
('call-of-duty-black-ops-ii-igdb-1122', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84 - 85. Stored score: 85/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=96s
Archive: https://emiliorankings.com/'),
('castlevania-aria-of-sorrow-igdb-1134', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s
Archive: https://emiliorankings.com/'),
('castlevania-circle-of-the-moon-igdb-1132', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s
Archive: https://emiliorankings.com/'),
('castlevania-harmony-of-dissonance-igdb-1133', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s
Archive: https://emiliorankings.com/'),
('castlevania-lords-of-shadow-igdb-491', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2553s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2567s
https://www.youtube.com/watch?v=_FjQzwLt1uE&t=1652s
Archive: https://emiliorankings.com/'),
('castlevania-lords-of-shadow-2-igdb-1182', 81, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80 - 81. Stored score: 81/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=_FjQzwLt1uE&t=1944s
Archive: https://emiliorankings.com/'),
('castlevania-symphony-of-the-night-igdb-1128', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=663s
https://www.youtube.com/watch?v=_FjQzwLt1uE&t=3633s
https://www.youtube.com/watch?v=hD5WjQrgkbc&t=1888s
Archive: https://emiliorankings.com/'),
('clair-obscur-expedition-33-igdb-305152', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=Ja8LYReRjTM&t=3036s
https://www.youtube.com/watch?v=PiMs9F5m17I&t=1504s
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=439s
Archive: https://emiliorankings.com/'),
('conker-s-bad-fur-day-igdb-1286', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=7M46OAGpDDc&t=14313s
Archive: https://emiliorankings.com/'),
('crysis-2-igdb-471', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2587s
https://www.youtube.com/watch?v=o2ZqufSDrqs&t=5660s
Archive: https://emiliorankings.com/'),
('crysis-3-igdb-1268', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1690s
Archive: https://emiliorankings.com/'),
('cyberpunk-2077', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=OxX1tabNaUw&t=284s
https://www.youtube.com/watch?v=200qyWFEg20&t=4680s
Archive: https://emiliorankings.com/'),
('dante-s-inferno-igdb-6958', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82. Stored score: 82/100.
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2548s
https://www.youtube.com/watch?v=PiMs9F5m17I&t=1510s
Archive: https://emiliorankings.com/'),
('dark-souls-iii-igdb-11133', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91 - 92. Stored score: 92/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=945s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s
Archive: https://emiliorankings.com/'),
('death-stranding', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 89. Stored score: 89/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=682s
https://www.youtube.com/watch?v=JZHl2CtRqsI&t=1623s
Archive: https://emiliorankings.com/'),
('death-stranding-2-on-the-beach-igdb-228530', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=JZHl2CtRqsI&t=2022s
Archive: https://emiliorankings.com/'),
('demon-s-souls-igdb-5619', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=371s
Archive: https://emiliorankings.com/'),
('detroit-become-human-1-igdb-14362', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 91. Stored score: 84/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=FVrJYiAMOK4&t=5558s
https://www.youtube.com/watch?v=vStw46wt0n4&t=7331s
Archive: https://emiliorankings.com/'),
('donkey-kong-igdb-1086', 65, 'Independently maintained reference rating from EmilioRankings.
Archived score: 60 - 70. Stored score: 65/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=17s
Archive: https://emiliorankings.com/'),
('donkey-kong-64-igdb-1096', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=OxX1tabNaUw&t=593s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1268s
Archive: https://emiliorankings.com/'),
('donkey-kong-bananza-igdb-338106', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87. Stored score: 87/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2478s
Archive: https://emiliorankings.com/'),
('donkey-kong-country-returns-igdb-1100', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1388s
https://www.youtube.com/watch?v=70VDvp3nVP8&t=3764s
Archive: https://emiliorankings.com/'),
('doom-2-igdb-7351', 80, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80. Stored score: 80/100.
YouTube sources:
https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=8106s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s
Archive: https://emiliorankings.com/'),
('doom-eternal-igdb-103298', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=8106s
https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=987s
Archive: https://emiliorankings.com/'),
('enslaved-odyssey-to-the-west-igdb-2538', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82. Stored score: 82/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=295s
Archive: https://emiliorankings.com/'),
('far-cry-3-igdb-529', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=104s
Archive: https://emiliorankings.com/'),
('fifa-14-igdb-2920', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=31s
Archive: https://emiliorankings.com/'),
('fifa-17-igdb-19459', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=36s
Archive: https://emiliorankings.com/'),
('final-fantasy-ii-1-igdb-16474', 79, 'Independently maintained reference rating from EmilioRankings.
Archived score: 78 - 79. Stored score: 79/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=c0H006lpqJA&t=162s
Archive: https://emiliorankings.com/'),
('final-fantasy-ix-igdb-421', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=pRzC5lfyOrY&t=9461s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1127s
Archive: https://emiliorankings.com/'),
('final-fantasy-vii-igdb-427', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5030s
https://www.youtube.com/watch?v=caWROOOTFn0&t=8051s
https://www.youtube.com/watch?v=pRzC5lfyOrY&t=9461s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1131s
https://www.youtube.com/watch?v=zqPsYXH0nhQ&t=8115s
https://www.youtube.com/watch?v=c0H006lpqJA&t=820s
Archive: https://emiliorankings.com/'),
('final-fantasy-vii-rebirth', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=LtEZfuiwQKE&t=1919s
https://www.youtube.com/watch?v=T46gBPJKsbY&t=1493s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1295s
Archive: https://emiliorankings.com/'),
('final-fantasy-vii-remake-igdb-11169', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=LtEZfuiwQKE&t=1919s
https://www.youtube.com/watch?v=T46gBPJKsbY&t=1493s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1198s
Archive: https://emiliorankings.com/'),
('final-fantasy-viii-igdb-425', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=521s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5030s
https://www.youtube.com/watch?v=c0H006lpqJA&t=998s
Archive: https://emiliorankings.com/'),
('final-fantasy-x-igdb-418', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=c0H006lpqJA&t=1388s
https://www.youtube.com/watch?v=pgv-IRwxJ8g&t=441s
https://www.youtube.com/watch?v=6nWN3BaL094&t=2995s
Archive: https://emiliorankings.com/'),
('final-fantasy-xii-igdb-398', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86 - 87. Stored score: 87/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=6nWN3BaL094&t=2977s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1603s
Archive: https://emiliorankings.com/'),
('final-fantasy-xv-igdb-359', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=Ja8LYReRjTM&t=2717s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1910s
Archive: https://emiliorankings.com/'),
('ghost-of-tsushima-igdb-75235', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87. Stored score: 87/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2539s
https://www.youtube.com/watch?v=cOwEi54eS98&t=6874s
https://www.youtube.com/watch?v=cOwEi54eS98&t=6607s
Archive: https://emiliorankings.com/'),
('god-of-war-igdb-549', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=6boalDhb1NE&t=1000s
https://www.youtube.com/watch?v=hD5WjQrgkbc&t=1847s
Archive: https://emiliorankings.com/'),
('god-of-war-1-igdb-19560', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s
https://www.youtube.com/watch?v=6boalDhb1NE&t=2552s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s
Archive: https://emiliorankings.com/'),
('god-of-war-ragnarok-igdb-112875', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s
Archive: https://emiliorankings.com/'),
('god-of-war-ascension-igdb-1291', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1690s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2555s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2087s
https://www.youtube.com/watch?v=aMDadYLOEj8&t=1816s
https://www.youtube.com/watch?v=AB0nwwqV7Ho&t=435s
Archive: https://emiliorankings.com/'),
('god-of-war-chains-of-olympus-igdb-552', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 86. Stored score: 86/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=qD7JKgibRn4&t=701s
Archive: https://emiliorankings.com/'),
('god-of-war-ghost-of-sparta-igdb-550', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 86. Stored score: 86/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=qD7JKgibRn4&t=701s
Archive: https://emiliorankings.com/'),
('goldeneye-007-igdb-1638', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=Ijcx3-EnAng&t=8357s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=1616s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=2361s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1142s
https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1838s
Archive: https://emiliorankings.com/'),
('grand-theft-auto-igdb-980', 78, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 79. Stored score: 78/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=251s
Archive: https://emiliorankings.com/'),
('grand-theft-auto-iv-igdb-731', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=34s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1307s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1492s
Archive: https://emiliorankings.com/'),
('grand-theft-auto-v-igdb-1020', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94 - 96. Stored score: 95/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=34s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8410s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1831s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=59s
Archive: https://emiliorankings.com/'),
('grand-theft-auto-san-andreas-igdb-732', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8420s
https://www.youtube.com/watch?v=ItgoFFHGEwM&t=266s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6138s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=884s
Archive: https://emiliorankings.com/'),
('grand-theft-auto-vice-city-igdb-733', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91 - 93. Stored score: 92/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8429s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=686s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1492s
Archive: https://emiliorankings.com/'),
('halo-2-igdb-986', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=MQLDKJw4OVM&t=14377s
Archive: https://emiliorankings.com/'),
('heavy-rain-igdb-493', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 81 - 90. Stored score: 86/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9517s
Archive: https://emiliorankings.com/'),
('hyrule-warriors-igdb-5314', 80, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80. Stored score: 80/100.
YouTube sources:
https://www.youtube.com/watch?v=aRG-xpnulhE&t=63s
https://www.youtube.com/watch?v=vak3vaJczxk&t=457s
Archive: https://emiliorankings.com/'),
('it-takes-two-igdb-135243', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 89. Stored score: 87/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2388s
Archive: https://emiliorankings.com/'),
('kirby-64-the-crystal-shards-igdb-2713', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=Gv9yE_L9qLY&t=5072s
Archive: https://emiliorankings.com/'),
('kirby-and-the-forgotten-land-igdb-172427', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2409s
https://www.youtube.com/watch?v=Gv9yE_L9qLY&t=5094s
https://www.youtube.com/watch?v=NkV48ty3MzY&t=3855s
https://www.youtube.com/watch?v=8EI544tbWec&t=10460s
Archive: https://emiliorankings.com/'),
('l-a-noire-igdb-109', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=222s
Archive: https://emiliorankings.com/'),
('lego-batman-2-dc-super-heroes-igdb-6836', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=c9_pGte1TLA&t=1073s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s
https://www.youtube.com/watch?v=pJyfjs24l-g&t=1232s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=9873s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1357s
Archive: https://emiliorankings.com/'),
('lego-batman-3-beyond-gotham-igdb-7685', 79, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 80. Stored score: 79/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=c9_pGte1TLA&t=1656s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s
Archive: https://emiliorankings.com/'),
('lego-batman-the-videogame-igdb-2738', 78, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 78. Stored score: 78/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=c9_pGte1TLA&t=727s
https://www.youtube.com/watch?v=AbHGXPgk64E&t=769s
Archive: https://emiliorankings.com/'),
('lego-marvel-super-heroes-igdb-2050', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=c9_pGte1TLA&t=1149s
https://www.youtube.com/watch?v=spmXYER6NFI&t=1791s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1339s
Archive: https://emiliorankings.com/'),
('lego-marvels-avengers-igdb-11069', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82. Stored score: 82/100.
YouTube sources:
https://www.youtube.com/watch?v=c9_pGte1TLA&t=1378s
Archive: https://emiliorankings.com/'),
('marvel-vs-capcom-clash-of-super-heroes-igdb-8246', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=8sznXrFhi-k&t=359s
Archive: https://emiliorankings.com/'),
('marvel-ultimate-alliance-igdb-4999', 80, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80. Stored score: 80/100.
YouTube sources:
https://www.youtube.com/watch?v=FMBQUcTT2CY&t=168s
https://www.youtube.com/watch?v=spmXYER6NFI&t=1220s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=943s
Archive: https://emiliorankings.com/'),
('marvel-ultimate-alliance-2-igdb-568', 77, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77. Stored score: 77/100.
YouTube sources:
https://www.youtube.com/watch?v=spmXYER6NFI&t=1401s
Archive: https://emiliorankings.com/'),
('marvels-spider-man-igdb-19565', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1286s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2948s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=6812s
https://www.youtube.com/watch?v=O7QHm3JiHi0&t=744s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1441s
Archive: https://emiliorankings.com/'),
('marvels-spider-man-2-igdb-127044', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2584s
https://www.youtube.com/watch?v=6H3nY-3F0n0&t=372s
https://www.youtube.com/watch?v=O7QHm3JiHi0&t=744s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1716s
Archive: https://emiliorankings.com/'),
('marvels-spider-man-miles-morales-igdb-134581', 79, 'Independently maintained reference rating from EmilioRankings.
Archived score: 79. Stored score: 79/100.
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7997s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1479s
Archive: https://emiliorankings.com/'),
('mass-effect-2-igdb-74', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=52s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=3341s
Archive: https://emiliorankings.com/'),
('mass-effect-3-igdb-75', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 89. Stored score: 89/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=3405s
Archive: https://emiliorankings.com/'),
('metal-gear-solid-igdb-375', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=YofuZbvqEUk&t=10883s
https://www.youtube.com/watch?v=caWROOOTFn0&t=8051s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=3624s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7711s
https://www.youtube.com/watch?v=zqPsYXH0nhQ&t=8115s
Archive: https://emiliorankings.com/'),
('metal-gear-solid-2-sons-of-liberty-igdb-376', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=1785s
Archive: https://emiliorankings.com/'),
('metal-gear-solid-3-snake-eater-igdb-379', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2873s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6107s
https://www.youtube.com/watch?v=8AlNEyPueEQ&t=10883s
Archive: https://emiliorankings.com/'),
('metal-gear-solid-4-guns-of-the-patriots-igdb-380', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2873s
Archive: https://emiliorankings.com/'),
('metal-gear-solid-v-the-phantom-pain-igdb-1985', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=6405s
Archive: https://emiliorankings.com/'),
('metroid-fusion-igdb-1104', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
Archive: https://emiliorankings.com/'),
('metroid-prime-igdb-1105', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1589s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=856s
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
https://www.youtube.com/watch?v=njaO3wLhVms&t=1100s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=1524s
Archive: https://emiliorankings.com/'),
('metroid-prime-2-echoes-igdb-1108', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=caWROOOTFn0&t=8056s
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
https://www.youtube.com/watch?v=njaO3wLhVms&t=1124s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=1524s
Archive: https://emiliorankings.com/'),
('metroid-prime-3-corruption-igdb-1111', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91 - 92. Stored score: 92/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2935s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=2482s
Archive: https://emiliorankings.com/'),
('metroid-dread-igdb-15698', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1568s
https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s
Archive: https://emiliorankings.com/'),
('metroid-other-m-igdb-1113', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=2550s
https://www.youtube.com/watch?v=EGRpd231FLg&t=423s
Archive: https://emiliorankings.com/'),
('metroid-zero-mission-igdb-1107', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
Archive: https://emiliorankings.com/'),
('mortal-kombat-2-igdb-1618', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91 - 92. Stored score: 92/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=261s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=581s
Archive: https://emiliorankings.com/'),
('mortal-kombat-3-igdb-1620', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90 - 91. Stored score: 91/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2709s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=581s
Archive: https://emiliorankings.com/'),
('mortal-kombat-4-igdb-1622', 76, 'Independently maintained reference rating from EmilioRankings.
Archived score: 70 - 82. Stored score: 76/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=aMDadYLOEj8&t=1133s
https://www.youtube.com/watch?v=eFKtLJJjKTk&t=8648s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=671s
Archive: https://emiliorankings.com/'),
('mortal-kombat-x-igdb-7292', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87 - 88. Stored score: 88/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=1326s
Archive: https://emiliorankings.com/'),
('mortal-kombat-armageddon-igdb-1616', 80, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80. Stored score: 80/100.
YouTube sources:
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=900s
Archive: https://emiliorankings.com/'),
('new-super-mario-bros-igdb-1076', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=6815s
Archive: https://emiliorankings.com/'),
('new-super-mario-bros-2-igdb-1080', 78, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 78. Stored score: 78/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2790s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8349s
https://www.youtube.com/watch?v=vStw46wt0n4&t=7537s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=6810s
Archive: https://emiliorankings.com/'),
('new-super-mario-bros-wii-igdb-2178', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1487s
Archive: https://emiliorankings.com/'),
('perfect-dark-igdb-1463', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=663s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=2361s
https://www.youtube.com/watch?v=o2ZqufSDrqs&t=5645s
Archive: https://emiliorankings.com/'),
('portal-igdb-71', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87. Stored score: 87/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2516s
Archive: https://emiliorankings.com/'),
('portal-2-igdb-72', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=52s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=4763s
Archive: https://emiliorankings.com/'),
('prince-of-persia-the-sands-of-time-igdb-836', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92 - 93. Stored score: 93/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=6nWN3BaL094&t=3099s
Archive: https://emiliorankings.com/'),
('prince-of-persia-warrior-within-igdb-837', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88 - 89. Stored score: 89/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=6nWN3BaL094&t=3118s
Archive: https://emiliorankings.com/'),
('pro-evolution-soccer-2008-igdb-4647', 81, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80 - 81. Stored score: 81/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=51s
Archive: https://emiliorankings.com/'),
('pro-evolution-soccer-2013-igdb-2941', 83, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82 - 83. Stored score: 83/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=26s
Archive: https://emiliorankings.com/'),
('psychonauts-igdb-1339', 87, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 88. Stored score: 87/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=854s
https://www.youtube.com/watch?v=sBTPOUY0YFI&t=11859s
Archive: https://emiliorankings.com/'),
('red-dead-redemption-2-igdb-25076', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93 - 95. Stored score: 94/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=8834s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=2095s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=71s
Archive: https://emiliorankings.com/'),
('red-dead-revolver-igdb-1969', 81, 'Independently maintained reference rating from EmilioRankings.
Archived score: 79 - 83. Stored score: 81/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=775s
Archive: https://emiliorankings.com/'),
('resident-evil-igdb-424', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90 - 91. Stored score: 91/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1303s
https://www.youtube.com/watch?v=HQdD0_2gxk4&t=2987s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=43s
Archive: https://emiliorankings.com/'),
('resident-evil-1-igdb-24869', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=HQdD0_2gxk4&t=2987s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1321s
Archive: https://emiliorankings.com/'),
('resident-evil-code-veronica-igdb-968', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1316s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8424s
https://www.youtube.com/watch?v=8AlNEyPueEQ&t=10877s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=613s
Archive: https://emiliorankings.com/'),
('resident-evil-2-igdb-880', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 92. Stored score: 91/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=687s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1308s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1076s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7703s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=348s
Archive: https://emiliorankings.com/'),
('resident-evil-3-nemesis-igdb-966', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1312s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1118s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=473s
Archive: https://emiliorankings.com/'),
('resident-evil-5-igdb-847', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7463s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=5063s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=1309s
Archive: https://emiliorankings.com/'),
('resident-evil-6-igdb-1082', 78, 'Independently maintained reference rating from EmilioRankings.
Archived score: 78. Stored score: 78/100.
YouTube sources:
https://www.youtube.com/watch?v=zMcvXLU6i00&t=786s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7464s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=5620s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=1450s
Archive: https://emiliorankings.com/'),
('resident-evil-7-biohazard-igdb-19562', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87 - 88. Stored score: 88/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2539s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2568s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=2451s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7453s
Archive: https://emiliorankings.com/'),
('resident-evil-requiem-igdb-347668', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 90. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=PiMs9F5m17I&t=1486s
https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1962s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=89s
Archive: https://emiliorankings.com/'),
('resident-evil-village-igdb-55163', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87 - 88. Stored score: 88/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2568s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2584s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=2522s
Archive: https://emiliorankings.com/'),
('resident-evil-zero-igdb-970', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=q0H16DsFeJU&t=730s
Archive: https://emiliorankings.com/'),
('rise-of-the-tomb-raider-igdb-7323', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=-bME3Y9mBy8&t=3226s
https://www.youtube.com/watch?v=lsqVblaRmPk&t=6960s
Archive: https://emiliorankings.com/'),
('robocop-rogue-city-igdb-154775', 83, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82 - 84. Stored score: 83/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=NkV48ty3MzY&t=3839s
https://www.youtube.com/watch?v=6H3nY-3F0n0&t=405s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2095s
Archive: https://emiliorankings.com/'),
('shadow-of-the-colossus-igdb-2207', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2856s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6126s
Archive: https://emiliorankings.com/'),
('shadow-of-the-tomb-raider-igdb-37777', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=-bME3Y9mBy8&t=3226s
Archive: https://emiliorankings.com/'),
('silent-hill-igdb-480', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91 - 93. Stored score: 92/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2822s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3863s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3245s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=295s
Archive: https://emiliorankings.com/'),
('silent-hill-2-igdb-481', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 91. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2014s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3859s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=300s
Archive: https://emiliorankings.com/'),
('silent-hill-3-igdb-482', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=432s
https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2014s
Archive: https://emiliorankings.com/'),
('silent-hill-4-the-room-igdb-483', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2063s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=535s
Archive: https://emiliorankings.com/'),
('silent-hill-downpour-igdb-487', 79, 'Independently maintained reference rating from EmilioRankings.
Archived score: 78 - 79. Stored score: 79/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=1056s
Archive: https://emiliorankings.com/'),
('silent-hill-homecoming-igdb-485', 83, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82 - 83. Stored score: 83/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=831s
Archive: https://emiliorankings.com/'),
('silent-hill-origins-igdb-484', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 81 - 82. Stored score: 82/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=630s
Archive: https://emiliorankings.com/'),
('silent-hill-shattered-memories-igdb-486', 80, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80. Stored score: 80/100.
YouTube sources:
https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2028s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=1001s
Archive: https://emiliorankings.com/'),
('sonic-3d-blast-igdb-9476', 83, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82 - 83. Stored score: 83/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=965s
Archive: https://emiliorankings.com/'),
('sonic-adventure-2-igdb-7858', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1342s
Archive: https://emiliorankings.com/'),
('sonic-colors-igdb-2267', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 80 - 84. Stored score: 82/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=yxc9hPA5k_w&t=5640s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1833s
Archive: https://emiliorankings.com/'),
('sonic-heroes-igdb-4156', 77, 'Independently maintained reference rating from EmilioRankings.
Archived score: 76 - 77. Stored score: 77/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1479s
Archive: https://emiliorankings.com/'),
('sonic-lost-world-igdb-2607', 69, 'Independently maintained reference rating from EmilioRankings.
Archived score: 68 - 70. Stored score: 69/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=yxc9hPA5k_w&t=7049s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=2056s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=2057s
Archive: https://emiliorankings.com/'),
('sonic-the-hedgehog-473de878-5a9f-402e-a282-86a7460fc1d2-igdb-6231', 65, 'Independently maintained reference rating from EmilioRankings.
Archived score: 60 - 70. Stored score: 65/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1557s
Archive: https://emiliorankings.com/'),
('soulcalibur-igdb-1564', 98, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97 - 98. Stored score: 98/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=nlELaxKhfMM&t=8814s
Archive: https://emiliorankings.com/'),
('spider-man-5-igdb-3603', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85 - 86. Stored score: 86/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8066s
https://www.youtube.com/watch?v=N326wO4eigg&t=1152s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=4202s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7367s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=854s
Archive: https://emiliorankings.com/'),
('spider-man-2-igdb-6285', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8068s
https://www.youtube.com/watch?v=N326wO4eigg&t=1120s
https://www.youtube.com/watch?v=V3N7lLj3M6g&t=4832s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1086s
Archive: https://emiliorankings.com/'),
('spider-man-2-enter-electro-igdb-4118', 81, 'Independently maintained reference rating from EmilioRankings.
Archived score: 81. Stored score: 81/100.
YouTube sources:
https://www.youtube.com/watch?v=_s_BqROZqx0&t=854s
Archive: https://emiliorankings.com/'),
('spider-man-3-igdb-5178', 78, 'Independently maintained reference rating from EmilioRankings.
Archived score: 77 - 78. Stored score: 78/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=bxD1gAkYMoc&t=1273s
Archive: https://emiliorankings.com/'),
('spider-man-shattered-dimensions-igdb-553', 82, 'Independently maintained reference rating from EmilioRankings.
Archived score: 82. Stored score: 82/100.
YouTube sources:
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=5962s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1375s
Archive: https://emiliorankings.com/'),
('star-wars-episode-i-the-phantom-menace-igdb-158', 75, 'Independently maintained reference rating from EmilioRankings.
Archived score: 70 - 80. Stored score: 75/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=0wdf19lLI5E&t=3653s
Archive: https://emiliorankings.com/'),
('starfield', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=FMBQUcTT2CY&t=8s
https://www.youtube.com/watch?v=OxX1tabNaUw&t=284s
Archive: https://emiliorankings.com/'),
('street-fighter-igdb-6930', 84, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84. Stored score: 84/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=299s
Archive: https://emiliorankings.com/'),
('street-fighter-ii-igdb-3186', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=253s
Archive: https://emiliorankings.com/'),
('super-mario-3d-land-igdb-1079', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11227s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2772s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8342s
Archive: https://emiliorankings.com/'),
('super-mario-3d-world-igdb-2180', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1679s
https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11261s
Archive: https://emiliorankings.com/'),
('super-mario-64-igdb-1074', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=1oACP9TUr68&t=678s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1268s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=3063s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=4906s
https://www.youtube.com/watch?v=LepF-pSByp0&t=1953s
Archive: https://emiliorankings.com/'),
('super-mario-bros-igdb-358', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=219s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=118s
Archive: https://emiliorankings.com/'),
('super-mario-bros-3-igdb-1068', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 96 - 97. Stored score: 97/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=595s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=419s
https://www.youtube.com/watch?v=sBTPOUY0YFI&t=11870s
Archive: https://emiliorankings.com/'),
('super-mario-galaxy-igdb-1077', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1159s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=5864s
https://www.youtube.com/watch?v=vStw46wt0n4&t=5591s
Archive: https://emiliorankings.com/'),
('super-mario-galaxy-2-igdb-1078', 98, 'Independently maintained reference rating from EmilioRankings.
Archived score: 98. Stored score: 98/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1350s
https://www.youtube.com/watch?v=yxc9hPA5k_w&t=5647s
Archive: https://emiliorankings.com/'),
('super-mario-odyssey-igdb-26758', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1865s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2374s
https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11409s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8338s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=7772s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=6544s
Archive: https://emiliorankings.com/'),
('super-mario-sunshine-igdb-1075', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=855s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2503s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=3063s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=4904s
https://www.youtube.com/watch?v=vStw46wt0n4&t=5266s
Archive: https://emiliorankings.com/'),
('super-mario-world-igdb-1070', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 96 - 97. Stored score: 97/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=542s
https://www.youtube.com/watch?v=1oACP9TUr68&t=595s
Archive: https://emiliorankings.com/'),
('super-metroid-igdb-1103', 96, 'Independently maintained reference rating from EmilioRankings.
Archived score: 96. Stored score: 96/100.
YouTube sources:
https://www.youtube.com/watch?v=njaO3wLhVms&t=1122s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2770s
Archive: https://emiliorankings.com/'),
('tekken-3-igdb-1244', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=605s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=285s
Archive: https://emiliorankings.com/'),
('the-elder-scrolls-iv-oblivion-igdb-59', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=208s
https://www.youtube.com/watch?v=HQdD0_2gxk4&t=4720s
Archive: https://emiliorankings.com/'),
('the-last-guardian-igdb-117', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2574s
Archive: https://emiliorankings.com/'),
('the-last-of-us-igdb-1009', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90 - 92. Stored score: 91/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1679s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=133s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=4265s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5034s
Archive: https://emiliorankings.com/'),
('the-last-of-us-part-ii-igdb-26192', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=163s
https://www.youtube.com/watch?v=02QWZJJCW-8&t=6119s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2880s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-a-link-between-worlds-igdb-2909', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=BTuf8VEDTZk&t=5723s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2782s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-a-link-to-the-past-igdb-1026', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=567s
https://www.youtube.com/watch?v=YofuZbvqEUk&t=10814s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-breath-of-the-wild-igdb-7346', 98, 'Independently maintained reference rating from EmilioRankings.
Archived score: 98. Stored score: 98/100.
YouTube sources:
https://www.youtube.com/watch?v=l0Mwjb5jtW0&t=9378s
https://www.youtube.com/watch?v=4oVQvJ3Xn-0&t=4770s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-links-awakening-igdb-1028', 96, 'Independently maintained reference rating from EmilioRankings.
Archived score: 96. Stored score: 96/100.
YouTube sources:
https://www.youtube.com/watch?v=l0kSNYaokqE&t=7492s
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=681s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-majora-s-mask-igdb-1030', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7599s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-ocarina-of-time-igdb-1029', 100, 'Independently maintained reference rating from EmilioRankings.
Archived score: 99 - 100. Stored score: 100/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=2lpQfQNglZM&t=396s
https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=5370s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7593s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-oracle-of-ages-igdb-1041', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=1244s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-oracle-of-seasons-igdb-1032', 91, 'Independently maintained reference rating from EmilioRankings.
Archived score: 91. Stored score: 91/100.
YouTube sources:
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=1244s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-skyward-sword-igdb-534', 98, 'Independently maintained reference rating from EmilioRankings.
Archived score: 98. Stored score: 98/100.
YouTube sources:
https://www.youtube.com/watch?v=l0Mwjb5jtW0&t=9378s
https://www.youtube.com/watch?v=4oVQvJ3Xn-0&t=4770s
https://www.youtube.com/watch?v=kM_XU4wv9t4&t=3111s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-tears-of-the-kingdom', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94 - 96. Stored score: 95/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=OxX1tabNaUw&t=304s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=240s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-the-minish-cap-igdb-1035', 95, 'Independently maintained reference rating from EmilioRankings.
Archived score: 95. Stored score: 95/100.
YouTube sources:
https://www.youtube.com/watch?v=l0kSNYaokqE&t=7492s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-the-wind-waker-igdb-1033', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=caWROOOTFn0&t=8056s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=851s
https://www.youtube.com/watch?v=BTuf8VEDTZk&t=3993s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-twilight-princess-igdb-1036', 96, 'Independently maintained reference rating from EmilioRankings.
Archived score: 96. Stored score: 96/100.
YouTube sources:
https://www.youtube.com/watch?v=FMBQUcTT2CY&t=422s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=851s
https://www.youtube.com/watch?v=uUQR9nXAITY&t=493s
https://www.youtube.com/watch?v=pGK1qv4QRfo&t=7140s
Archive: https://emiliorankings.com/'),
('the-witcher-igdb-80', 86, 'Independently maintained reference rating from EmilioRankings.
Archived score: 86. Stored score: 86/100.
YouTube sources:
https://www.youtube.com/watch?v=kM_XU4wv9t4&t=2025s
Archive: https://emiliorankings.com/'),
('the-witcher-2-assassins-of-kings-igdb-478', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=399vFDRz6aA&t=2168s
Archive: https://emiliorankings.com/'),
('the-witcher-3-wild-hunt-igdb-1942', 97, 'Independently maintained reference rating from EmilioRankings.
Archived score: 97. Stored score: 97/100.
YouTube sources:
https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1589s
https://www.youtube.com/watch?v=OxX1tabNaUw&t=289s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=3083s
Archive: https://emiliorankings.com/'),
('tom-clancy-s-splinter-cell-conviction-igdb-562', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 84 - 85. Stored score: 85/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9528s
Archive: https://emiliorankings.com/'),
('tomb-raider-2-igdb-1164', 89, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89. Stored score: 89/100.
YouTube sources:
https://www.youtube.com/watch?v=1oACP9TUr68&t=1688s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=3840s
Archive: https://emiliorankings.com/'),
('ultimate-spider-man-igdb-4225', 83, 'Independently maintained reference rating from EmilioRankings.
Archived score: 83. Stored score: 83/100.
YouTube sources:
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1000s
Archive: https://emiliorankings.com/'),
('uncharted-2-among-thieves-igdb-565', 94, 'Independently maintained reference rating from EmilioRankings.
Archived score: 94. Stored score: 94/100.
YouTube sources:
https://www.youtube.com/watch?v=2KYr62jtORQ&t=87s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=2150s
Archive: https://emiliorankings.com/'),
('uncharted-3-drake-s-deception-igdb-512', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=2936s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=92s
Archive: https://emiliorankings.com/'),
('uncharted-4-a-thief-s-end-igdb-7331', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8530s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s
Archive: https://emiliorankings.com/'),
('uncharted-the-lost-legacy-igdb-26193', 75, 'Independently maintained reference rating from EmilioRankings.
Archived score: 74 - 75. Stored score: 75/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=6093s
Archive: https://emiliorankings.com/'),
('xenoblade-chronicles-igdb-2364', 93, 'Independently maintained reference rating from EmilioRankings.
Archived score: 93. Stored score: 93/100.
YouTube sources:
https://www.youtube.com/watch?v=Ja8LYReRjTM&t=2671s
Archive: https://emiliorankings.com/'),
('xenoblade-chronicles-3-igdb-191411', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 90. Stored score: 90/100.
YouTube sources:
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1616s
Archive: https://emiliorankings.com/'),
('x-men-origins-wolverine-igdb-573', 79, 'Independently maintained reference rating from EmilioRankings.
Archived score: 79. Stored score: 79/100.
YouTube sources:
https://www.youtube.com/watch?v=FMBQUcTT2CY&t=215s
https://www.youtube.com/watch?v=5Fm-eHkYFus&t=1356s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1381s
Archive: https://emiliorankings.com/'),
('bioshock-2-igdb-21', 92, 'Independently maintained reference rating from EmilioRankings.
Archived score: 92. Stored score: 92/100.
YouTube sources:
https://www.youtube.com/watch?v=yLM4pbEchJs&t=463s
Archive: https://emiliorankings.com/'),
('metroid-ii-return-of-samus-igdb-1102', 90, 'Independently maintained reference rating from EmilioRankings.
Archived score: 89 - 90. Stored score: 90/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=8AbUg7QOvg4&t=497s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-spirit-tracks-igdb-1038', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 87 - 89. Stored score: 88/100 (rounded midpoint).
YouTube sources:
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=2544s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-phantom-hourglass-igdb-1037', 88, 'Independently maintained reference rating from EmilioRankings.
Archived score: 88. Stored score: 88/100.
YouTube sources:
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=2408s
Archive: https://emiliorankings.com/'),
('the-legend-of-zelda-echoes-of-wisdom-igdb-306149', 85, 'Independently maintained reference rating from EmilioRankings.
Archived score: 85. Stored score: 85/100.
YouTube sources:
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=3846s
Archive: https://emiliorankings.com/')
) as v(slug,score,review)
join public.games g on g.slug=v.slug
join public.profiles p on p.handle='tiempo_de_videojuegos' and p.owner_user_id is null
on conflict(profile_id,game_id) do nothing;
commit;
