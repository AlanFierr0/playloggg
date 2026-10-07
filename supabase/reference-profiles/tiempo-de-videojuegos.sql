-- Database-managed reference; no Auth account is created or assigned.
begin;
insert into public.profiles(handle,display_name,is_public,is_discoverable,owner_user_id,bio)
values ('tiempo_de_videojuegos','Tiempo de Videojuegos',true,false,null,'Perfil de referencia mantenido de forma independiente; no es una cuenta oficial. Las puntuaciones provienen de los videos de Tiempo de Videojuegos a través de EmilioRankings.')
on conflict(handle) do nothing;
do $$ begin
  if not exists(select 1 from public.profiles where handle='tiempo_de_videojuegos' and owner_user_id is null and is_public)
  then raise exception 'Expected unowned public reference profile'; end if;
end $$;
insert into public.ratings(profile_id,game_id,score,review,status)
select p.id,g.id,v.score,v.review,'completed' from (values
('007-first-light-igdb-141114', 86, 'https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1960s'),
('a-plague-tale-innocence-igdb-27316', 84, 'https://www.youtube.com/watch?v=NkV48ty3MzY&t=3839s'),
('a-plague-tale-requiem-igdb-152242', 84, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2580s'),
('alan-wake-igdb-1062', 81, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=320s
https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9515s'),
('astral-chain-igdb-115283', 85, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2638s'),
('astro-bot-igdb-303811', 90, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2419s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5034s'),
('batman-arkham-asylum-igdb-500', 91, 'https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=7382s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=5733s'),
('batman-arkham-city-igdb-501', 95, 'https://www.youtube.com/watch?v=ZXJgylKpXBY&t=6017s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=64s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=200qyWFEg20&t=4605s
https://www.youtube.com/watch?v=gA3I2-cR1b0&t=1349s'),
('batman-arkham-knight-igdb-5503', 91, 'https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1250s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1435s'),
('batman-arkham-origins-igdb-2003', 86, 'https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s
https://www.youtube.com/watch?v=gA3I2-cR1b0&t=1307s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=9917s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5544s'),
('batman-the-video-game-2-igdb-49226', 55, 'https://www.youtube.com/watch?v=V3N7lLj3M6g&t=2088s'),
('bayonetta-igdb-2136', 89, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2557s'),
('bayonetta-2-igdb-2135', 92, 'https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s'),
('bayonetta-3-igdb-76888', 88, 'https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s'),
('bioshock-igdb-20', 94, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=98s
https://www.youtube.com/watch?v=0X88m94CzdA&t=10081s'),
('bioshock-infinite-igdb-538', 90, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1685s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=194s'),
('black-igdb-5749', 86, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2516s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=4475s
https://www.youtube.com/watch?v=7M46OAGpDDc&t=11384s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=9283s'),
('bloodborne', 92, 'https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=743s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s'),
('call-of-duty-4-modern-warfare-igdb-623', 90, 'https://www.youtube.com/watch?v=6boalDhb1NE&t=1268s'),
('call-of-duty-black-ops-igdb-545', 90, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=96s'),
('call-of-duty-black-ops-ii-igdb-1122', 85, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=96s'),
('castlevania-aria-of-sorrow-igdb-1134', 90, 'https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s'),
('castlevania-circle-of-the-moon-igdb-1132', 90, 'https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s'),
('castlevania-harmony-of-dissonance-igdb-1133', 90, 'https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6428s'),
('castlevania-lords-of-shadow-igdb-491', 86, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2553s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2567s
https://www.youtube.com/watch?v=_FjQzwLt1uE&t=1652s'),
('castlevania-lords-of-shadow-2-igdb-1182', 81, 'https://www.youtube.com/watch?v=_FjQzwLt1uE&t=1944s'),
('castlevania-symphony-of-the-night-igdb-1128', 94, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=663s
https://www.youtube.com/watch?v=_FjQzwLt1uE&t=3633s
https://www.youtube.com/watch?v=hD5WjQrgkbc&t=1888s'),
('clair-obscur-expedition-33-igdb-305152', 91, 'https://www.youtube.com/watch?v=Ja8LYReRjTM&t=3036s
https://www.youtube.com/watch?v=PiMs9F5m17I&t=1504s
https://www.youtube.com/watch?v=Q0BacibjlzQ&t=439s'),
('conker-s-bad-fur-day-igdb-1286', 95, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=7M46OAGpDDc&t=14313s'),
('crysis-2-igdb-471', 88, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2587s
https://www.youtube.com/watch?v=o2ZqufSDrqs&t=5660s'),
('crysis-3-igdb-1268', 84, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1690s'),
('cyberpunk-2077', 92, 'https://www.youtube.com/watch?v=OxX1tabNaUw&t=284s
https://www.youtube.com/watch?v=200qyWFEg20&t=4680s'),
('dante-s-inferno-igdb-6958', 82, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2548s
https://www.youtube.com/watch?v=PiMs9F5m17I&t=1510s'),
('dark-souls-iii-igdb-11133', 92, 'https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=945s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s'),
('death-stranding', 89, 'https://www.youtube.com/watch?v=Q0BacibjlzQ&t=682s
https://www.youtube.com/watch?v=JZHl2CtRqsI&t=1623s'),
('death-stranding-2-on-the-beach-igdb-228530', 90, 'https://www.youtube.com/watch?v=JZHl2CtRqsI&t=2022s'),
('demon-s-souls-igdb-5619', 89, 'https://www.youtube.com/watch?v=clQ4gkzQmjQ&t=371s'),
('detroit-become-human-1-igdb-14362', 84, 'https://www.youtube.com/watch?v=FVrJYiAMOK4&t=5558s
https://www.youtube.com/watch?v=vStw46wt0n4&t=7331s'),
('donkey-kong-igdb-1086', 65, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=17s'),
('donkey-kong-64-igdb-1096', 89, 'https://www.youtube.com/watch?v=OxX1tabNaUw&t=593s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1268s'),
('donkey-kong-bananza-igdb-338106', 87, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2478s'),
('donkey-kong-country-returns-igdb-1100', 89, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1388s
https://www.youtube.com/watch?v=70VDvp3nVP8&t=3764s'),
('doom-2-igdb-7351', 80, 'https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=8106s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2947s'),
('doom-eternal-igdb-103298', 93, 'https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=8106s
https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=987s'),
('enslaved-odyssey-to-the-west-igdb-2538', 82, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=295s'),
('far-cry-3-igdb-529', 86, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=104s'),
('fifa-14-igdb-2920', 85, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=31s'),
('fifa-17-igdb-19459', 85, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=36s'),
('final-fantasy-ii-1-igdb-16474', 79, 'https://www.youtube.com/watch?v=c0H006lpqJA&t=162s'),
('final-fantasy-ix-igdb-421', 93, 'https://www.youtube.com/watch?v=pRzC5lfyOrY&t=9461s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1127s'),
('final-fantasy-vii-igdb-427', 95, 'https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5030s
https://www.youtube.com/watch?v=caWROOOTFn0&t=8051s
https://www.youtube.com/watch?v=pRzC5lfyOrY&t=9461s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1131s
https://www.youtube.com/watch?v=zqPsYXH0nhQ&t=8115s
https://www.youtube.com/watch?v=c0H006lpqJA&t=820s'),
('final-fantasy-vii-rebirth', 95, 'https://www.youtube.com/watch?v=LtEZfuiwQKE&t=1919s
https://www.youtube.com/watch?v=T46gBPJKsbY&t=1493s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1295s'),
('final-fantasy-vii-remake-igdb-11169', 95, 'https://www.youtube.com/watch?v=LtEZfuiwQKE&t=1919s
https://www.youtube.com/watch?v=T46gBPJKsbY&t=1493s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1198s'),
('final-fantasy-viii-igdb-425', 90, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=521s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5030s
https://www.youtube.com/watch?v=c0H006lpqJA&t=998s'),
('final-fantasy-x-igdb-418', 91, 'https://www.youtube.com/watch?v=c0H006lpqJA&t=1388s
https://www.youtube.com/watch?v=pgv-IRwxJ8g&t=441s
https://www.youtube.com/watch?v=6nWN3BaL094&t=2995s'),
('final-fantasy-xii-igdb-398', 87, 'https://www.youtube.com/watch?v=6nWN3BaL094&t=2977s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1603s'),
('final-fantasy-xv-igdb-359', 92, 'https://www.youtube.com/watch?v=Ja8LYReRjTM&t=2717s
https://www.youtube.com/watch?v=c0H006lpqJA&t=1910s'),
('ghost-of-tsushima-igdb-75235', 87, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2539s
https://www.youtube.com/watch?v=cOwEi54eS98&t=6874s
https://www.youtube.com/watch?v=cOwEi54eS98&t=6607s'),
('god-of-war-igdb-549', 91, 'https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=6boalDhb1NE&t=1000s
https://www.youtube.com/watch?v=hD5WjQrgkbc&t=1847s'),
('god-of-war-1-igdb-19560', 94, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s
https://www.youtube.com/watch?v=6boalDhb1NE&t=2552s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s'),
('god-of-war-ragnarok-igdb-112875', 91, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s'),
('god-of-war-ascension-igdb-1291', 84, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1690s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2555s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2087s
https://www.youtube.com/watch?v=aMDadYLOEj8&t=1816s
https://www.youtube.com/watch?v=AB0nwwqV7Ho&t=435s'),
('god-of-war-chains-of-olympus-igdb-552', 86, 'https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=qD7JKgibRn4&t=701s'),
('god-of-war-ghost-of-sparta-igdb-550', 86, 'https://www.youtube.com/watch?v=nlELaxKhfMM&t=2030s
https://www.youtube.com/watch?v=qD7JKgibRn4&t=701s'),
('goldeneye-007-igdb-1638', 95, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=Ijcx3-EnAng&t=8357s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=1616s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=2361s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1142s
https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1838s'),
('grand-theft-auto-igdb-980', 78, 'https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=251s'),
('grand-theft-auto-iv-igdb-731', 92, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=34s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1307s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1492s'),
('grand-theft-auto-v-igdb-1020', 95, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=34s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8410s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1831s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=59s'),
('grand-theft-auto-san-andreas-igdb-732', 94, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8420s
https://www.youtube.com/watch?v=ItgoFFHGEwM&t=266s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6138s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=884s'),
('grand-theft-auto-vice-city-igdb-733', 92, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8429s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=686s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=1492s'),
('halo-2-igdb-986', 94, 'https://www.youtube.com/watch?v=MQLDKJw4OVM&t=14377s'),
('heavy-rain-igdb-493', 86, 'https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9517s'),
('hyrule-warriors-igdb-5314', 80, 'https://www.youtube.com/watch?v=aRG-xpnulhE&t=63s
https://www.youtube.com/watch?v=vak3vaJczxk&t=457s'),
('it-takes-two-igdb-135243', 87, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2388s'),
('kirby-64-the-crystal-shards-igdb-2713', 84, 'https://www.youtube.com/watch?v=Gv9yE_L9qLY&t=5072s'),
('kirby-and-the-forgotten-land-igdb-172427', 85, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2409s
https://www.youtube.com/watch?v=Gv9yE_L9qLY&t=5094s
https://www.youtube.com/watch?v=NkV48ty3MzY&t=3855s
https://www.youtube.com/watch?v=8EI544tbWec&t=10460s'),
('l-a-noire-igdb-109', 90, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=222s'),
('lego-batman-2-dc-super-heroes-igdb-6836', 84, 'https://www.youtube.com/watch?v=c9_pGte1TLA&t=1073s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s
https://www.youtube.com/watch?v=pJyfjs24l-g&t=1232s
https://www.youtube.com/watch?v=gZKvqb6gEBk&t=9873s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1357s'),
('lego-batman-3-beyond-gotham-igdb-7685', 79, 'https://www.youtube.com/watch?v=c9_pGte1TLA&t=1656s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5712s'),
('lego-batman-the-videogame-igdb-2738', 78, 'https://www.youtube.com/watch?v=c9_pGte1TLA&t=727s
https://www.youtube.com/watch?v=AbHGXPgk64E&t=769s'),
('lego-marvel-super-heroes-igdb-2050', 86, 'https://www.youtube.com/watch?v=c9_pGte1TLA&t=1149s
https://www.youtube.com/watch?v=spmXYER6NFI&t=1791s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1339s'),
('lego-marvels-avengers-igdb-11069', 82, 'https://www.youtube.com/watch?v=c9_pGte1TLA&t=1378s'),
('marvel-vs-capcom-clash-of-super-heroes-igdb-8246', 90, 'https://www.youtube.com/watch?v=8sznXrFhi-k&t=359s'),
('marvel-ultimate-alliance-igdb-4999', 80, 'https://www.youtube.com/watch?v=FMBQUcTT2CY&t=168s
https://www.youtube.com/watch?v=spmXYER6NFI&t=1220s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=943s'),
('marvel-ultimate-alliance-2-igdb-568', 77, 'https://www.youtube.com/watch?v=spmXYER6NFI&t=1401s'),
('marvels-spider-man-igdb-19565', 90, 'https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1286s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2948s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=6812s
https://www.youtube.com/watch?v=O7QHm3JiHi0&t=744s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1441s'),
('marvels-spider-man-2-igdb-127044', 88, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2584s
https://www.youtube.com/watch?v=6H3nY-3F0n0&t=372s
https://www.youtube.com/watch?v=O7QHm3JiHi0&t=744s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1716s'),
('marvels-spider-man-miles-morales-igdb-134581', 79, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7997s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1479s'),
('mass-effect-2-igdb-74', 93, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=52s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=3341s'),
('mass-effect-3-igdb-75', 89, 'https://www.youtube.com/watch?v=OgUjDPHV-RM&t=3405s'),
('metal-gear-solid-igdb-375', 95, 'https://www.youtube.com/watch?v=YofuZbvqEUk&t=10883s
https://www.youtube.com/watch?v=caWROOOTFn0&t=8051s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=3624s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7711s
https://www.youtube.com/watch?v=zqPsYXH0nhQ&t=8115s'),
('metal-gear-solid-2-sons-of-liberty-igdb-376', 91, 'https://www.youtube.com/watch?v=OgUjDPHV-RM&t=1785s'),
('metal-gear-solid-3-snake-eater-igdb-379', 94, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2873s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6107s
https://www.youtube.com/watch?v=8AlNEyPueEQ&t=10883s'),
('metal-gear-solid-4-guns-of-the-patriots-igdb-380', 93, 'https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2873s'),
('metal-gear-solid-v-the-phantom-pain-igdb-1985', 91, 'https://www.youtube.com/watch?v=EKZC4K3CYaw&t=5681s
https://www.youtube.com/watch?v=EKZC4K3CYaw&t=6405s'),
('metroid-fusion-igdb-1104', 89, 'https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s'),
('metroid-prime-igdb-1105', 97, 'https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1589s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=856s
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
https://www.youtube.com/watch?v=njaO3wLhVms&t=1100s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=1524s'),
('metroid-prime-2-echoes-igdb-1108', 94, 'https://www.youtube.com/watch?v=caWROOOTFn0&t=8056s
https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s
https://www.youtube.com/watch?v=njaO3wLhVms&t=1124s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=1524s'),
('metroid-prime-3-corruption-igdb-1111', 92, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2935s
https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=2482s'),
('metroid-dread-igdb-15698', 92, 'https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1568s
https://www.youtube.com/watch?v=ra3-4mpGeok&t=10287s'),
('metroid-other-m-igdb-1113', 85, 'https://www.youtube.com/watch?v=2jp_j_wR4Mc&t=2550s
https://www.youtube.com/watch?v=EGRpd231FLg&t=423s'),
('metroid-zero-mission-igdb-1107', 90, 'https://www.youtube.com/watch?v=e-bw4HjzBE0&t=6417s'),
('mortal-kombat-2-igdb-1618', 92, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=261s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=581s'),
('mortal-kombat-3-igdb-1620', 91, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2709s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=581s'),
('mortal-kombat-4-igdb-1622', 76, 'https://www.youtube.com/watch?v=aMDadYLOEj8&t=1133s
https://www.youtube.com/watch?v=eFKtLJJjKTk&t=8648s
https://www.youtube.com/watch?v=hAVxYZhlYeA&t=671s'),
('mortal-kombat-x-igdb-7292', 88, 'https://www.youtube.com/watch?v=hAVxYZhlYeA&t=1326s'),
('mortal-kombat-armageddon-igdb-1616', 80, 'https://www.youtube.com/watch?v=hAVxYZhlYeA&t=900s'),
('new-super-mario-bros-igdb-1076', 89, 'https://www.youtube.com/watch?v=tOzbjcfzwf8&t=6815s'),
('new-super-mario-bros-2-igdb-1080', 78, 'https://www.youtube.com/watch?v=rr_BHUZFt20&t=2790s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8349s
https://www.youtube.com/watch?v=vStw46wt0n4&t=7537s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=6810s'),
('new-super-mario-bros-wii-igdb-2178', 90, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1487s'),
('perfect-dark-igdb-1463', 94, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=663s
https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=2361s
https://www.youtube.com/watch?v=o2ZqufSDrqs&t=5645s'),
('portal-igdb-71', 87, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2516s'),
('portal-2-igdb-72', 93, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=52s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=4763s'),
('prince-of-persia-the-sands-of-time-igdb-836', 93, 'https://www.youtube.com/watch?v=6nWN3BaL094&t=3099s'),
('prince-of-persia-warrior-within-igdb-837', 89, 'https://www.youtube.com/watch?v=6nWN3BaL094&t=3118s'),
('pro-evolution-soccer-2008-igdb-4647', 81, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=51s'),
('pro-evolution-soccer-2013-igdb-2941', 83, 'https://www.youtube.com/watch?v=H3NKzeMHfO0&t=26s'),
('psychonauts-igdb-1339', 87, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=854s
https://www.youtube.com/watch?v=sBTPOUY0YFI&t=11859s'),
('red-dead-redemption-2-igdb-25076', 94, 'https://www.youtube.com/watch?v=ZMryGVrnhJ8&t=8834s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=272s
https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=2095s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=71s'),
('red-dead-revolver-igdb-1969', 81, 'https://www.youtube.com/watch?v=U-DdU6Tyb7s&t=775s'),
('resident-evil-igdb-424', 91, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1303s
https://www.youtube.com/watch?v=HQdD0_2gxk4&t=2987s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=43s'),
('resident-evil-1-igdb-24869', 92, 'https://www.youtube.com/watch?v=HQdD0_2gxk4&t=2987s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1321s'),
('resident-evil-code-veronica-igdb-968', 90, 'https://www.youtube.com/watch?v=p_KeHefaEQU&t=1316s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8424s
https://www.youtube.com/watch?v=8AlNEyPueEQ&t=10877s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=613s'),
('resident-evil-2-igdb-880', 91, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=687s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1308s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1076s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7703s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=348s'),
('resident-evil-3-nemesis-igdb-966', 90, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=8425s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=1312s
https://www.youtube.com/watch?v=KGrywJnFSfg&t=1118s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=473s'),
('resident-evil-5-igdb-847', 85, 'https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7463s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=5063s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=1309s'),
('resident-evil-6-igdb-1082', 78, 'https://www.youtube.com/watch?v=zMcvXLU6i00&t=786s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7464s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=5620s
https://www.youtube.com/watch?v=q0H16DsFeJU&t=1450s'),
('resident-evil-7-biohazard-igdb-19562', 88, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2539s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2568s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=2451s
https://www.youtube.com/watch?v=xnS0WQH6E8k&t=7453s'),
('resident-evil-requiem-igdb-347668', 90, 'https://www.youtube.com/watch?v=PiMs9F5m17I&t=1486s
https://www.youtube.com/watch?v=dqgz3j4ks7U&t=1962s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=89s'),
('resident-evil-village-igdb-55163', 88, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2568s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2584s
https://www.youtube.com/watch?v=p_KeHefaEQU&t=2522s'),
('resident-evil-zero-igdb-970', 84, 'https://www.youtube.com/watch?v=q0H16DsFeJU&t=730s'),
('rise-of-the-tomb-raider-igdb-7323', 89, 'https://www.youtube.com/watch?v=-bME3Y9mBy8&t=3226s
https://www.youtube.com/watch?v=lsqVblaRmPk&t=6960s'),
('robocop-rogue-city-igdb-154775', 83, 'https://www.youtube.com/watch?v=NkV48ty3MzY&t=3839s
https://www.youtube.com/watch?v=6H3nY-3F0n0&t=405s
https://www.youtube.com/watch?v=nlELaxKhfMM&t=2095s'),
('shadow-of-the-colossus-igdb-2207', 92, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=748s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2856s
https://www.youtube.com/watch?v=c4mnCIeWpH4&t=6126s'),
('shadow-of-the-tomb-raider-igdb-37777', 89, 'https://www.youtube.com/watch?v=-bME3Y9mBy8&t=3226s'),
('silent-hill-igdb-480', 92, 'https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2822s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3863s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3245s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=295s'),
('silent-hill-2-igdb-481', 90, 'https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2014s
https://www.youtube.com/watch?v=hqKDIRroLgw&t=3859s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=300s'),
('silent-hill-3-igdb-482', 89, 'https://www.youtube.com/watch?v=BN3t8qCG-nI&t=432s
https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2014s'),
('silent-hill-4-the-room-igdb-483', 84, 'https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2063s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=535s'),
('silent-hill-downpour-igdb-487', 79, 'https://www.youtube.com/watch?v=BN3t8qCG-nI&t=1056s'),
('silent-hill-homecoming-igdb-485', 83, 'https://www.youtube.com/watch?v=BN3t8qCG-nI&t=831s'),
('silent-hill-origins-igdb-484', 82, 'https://www.youtube.com/watch?v=BN3t8qCG-nI&t=630s'),
('silent-hill-shattered-memories-igdb-486', 80, 'https://www.youtube.com/watch?v=a5gQu0Lf8fg&t=2028s
https://www.youtube.com/watch?v=BN3t8qCG-nI&t=1001s'),
('sonic-3d-blast-igdb-9476', 83, 'https://www.youtube.com/watch?v=OvcsIqj8fbc&t=965s'),
('sonic-adventure-2-igdb-7858', 88, 'https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1342s'),
('sonic-colors-igdb-2267', 82, 'https://www.youtube.com/watch?v=yxc9hPA5k_w&t=5640s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1833s'),
('sonic-heroes-igdb-4156', 77, 'https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1479s'),
('sonic-lost-world-igdb-2607', 69, 'https://www.youtube.com/watch?v=yxc9hPA5k_w&t=7049s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=2056s
https://www.youtube.com/watch?v=OvcsIqj8fbc&t=2057s'),
('sonic-the-hedgehog-473de878-5a9f-402e-a282-86a7460fc1d2-igdb-6231', 65, 'https://www.youtube.com/watch?v=OvcsIqj8fbc&t=1557s'),
('soulcalibur-igdb-1564', 98, 'https://www.youtube.com/watch?v=nlELaxKhfMM&t=8814s'),
('spider-man-5-igdb-3603', 86, 'https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8066s
https://www.youtube.com/watch?v=N326wO4eigg&t=1152s
https://www.youtube.com/watch?v=ZXJgylKpXBY&t=4202s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7367s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=854s'),
('spider-man-2-igdb-6285', 84, 'https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8068s
https://www.youtube.com/watch?v=N326wO4eigg&t=1120s
https://www.youtube.com/watch?v=V3N7lLj3M6g&t=4832s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1086s'),
('spider-man-2-enter-electro-igdb-4118', 81, 'https://www.youtube.com/watch?v=_s_BqROZqx0&t=854s'),
('spider-man-3-igdb-5178', 78, 'https://www.youtube.com/watch?v=bxD1gAkYMoc&t=1273s'),
('spider-man-shattered-dimensions-igdb-553', 82, 'https://www.youtube.com/watch?v=ZXJgylKpXBY&t=5962s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1375s'),
('star-wars-episode-i-the-phantom-menace-igdb-158', 75, 'https://www.youtube.com/watch?v=0wdf19lLI5E&t=3653s'),
('starfield', 89, 'https://www.youtube.com/watch?v=FMBQUcTT2CY&t=8s
https://www.youtube.com/watch?v=OxX1tabNaUw&t=284s'),
('street-fighter-igdb-6930', 84, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=299s'),
('street-fighter-ii-igdb-3186', 97, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=253s'),
('super-mario-3d-land-igdb-1079', 92, 'https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11227s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2772s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8342s'),
('super-mario-3d-world-igdb-2180', 91, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1679s
https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11261s'),
('super-mario-64-igdb-1074', 95, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=1oACP9TUr68&t=678s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=1268s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=3063s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=4906s
https://www.youtube.com/watch?v=LepF-pSByp0&t=1953s'),
('super-mario-bros-igdb-358', 85, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=219s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=118s'),
('super-mario-bros-3-igdb-1068', 97, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=595s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=419s
https://www.youtube.com/watch?v=sBTPOUY0YFI&t=11870s'),
('super-mario-galaxy-igdb-1077', 97, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1159s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=5864s
https://www.youtube.com/watch?v=vStw46wt0n4&t=5591s'),
('super-mario-galaxy-2-igdb-1078', 98, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1350s
https://www.youtube.com/watch?v=yxc9hPA5k_w&t=5647s'),
('super-mario-odyssey-igdb-26758', 92, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1865s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2374s
https://www.youtube.com/watch?v=X1ZrQWnotbc&t=11409s
https://www.youtube.com/watch?v=lfxi9EQjfns&t=8338s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=7772s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=6544s'),
('super-mario-sunshine-igdb-1075', 88, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=855s
https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2503s
https://www.youtube.com/watch?v=VkPJxFhITDs&t=3063s
https://www.youtube.com/watch?v=tOzbjcfzwf8&t=4904s
https://www.youtube.com/watch?v=vStw46wt0n4&t=5266s'),
('super-mario-world-igdb-1070', 97, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=542s
https://www.youtube.com/watch?v=1oACP9TUr68&t=595s'),
('super-metroid-igdb-1103', 96, 'https://www.youtube.com/watch?v=njaO3wLhVms&t=1122s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=2770s'),
('tekken-3-igdb-1244', 95, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=605s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=285s'),
('the-elder-scrolls-iv-oblivion-igdb-59', 94, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=208s
https://www.youtube.com/watch?v=HQdD0_2gxk4&t=4720s'),
('the-last-guardian-igdb-117', 86, 'https://www.youtube.com/watch?v=iXmm-c7xWfw&t=2574s'),
('the-last-of-us-igdb-1009', 91, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1679s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=133s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=4265s
https://www.youtube.com/watch?v=EM-KbMrAyDk&t=5034s'),
('the-last-of-us-part-ii-igdb-26192', 93, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=163s
https://www.youtube.com/watch?v=02QWZJJCW-8&t=6119s
https://www.youtube.com/watch?v=OgUjDPHV-RM&t=2880s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s'),
('the-legend-of-zelda-a-link-between-worlds-igdb-2909', 92, 'https://www.youtube.com/watch?v=BTuf8VEDTZk&t=5723s
https://www.youtube.com/watch?v=rr_BHUZFt20&t=2782s'),
('the-legend-of-zelda-a-link-to-the-past-igdb-1026', 97, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=567s
https://www.youtube.com/watch?v=YofuZbvqEUk&t=10814s'),
('the-legend-of-zelda-breath-of-the-wild-igdb-7346', 98, 'https://www.youtube.com/watch?v=l0Mwjb5jtW0&t=9378s
https://www.youtube.com/watch?v=4oVQvJ3Xn-0&t=4770s'),
('the-legend-of-zelda-links-awakening-igdb-1028', 96, 'https://www.youtube.com/watch?v=l0kSNYaokqE&t=7492s
https://www.youtube.com/watch?v=GmUuE7QiFkA&t=681s'),
('the-legend-of-zelda-majora-s-mask-igdb-1030', 97, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7599s'),
('the-legend-of-zelda-ocarina-of-time-igdb-1029', 100, 'https://www.youtube.com/watch?v=GrHk_mNkgSI&t=637s
https://www.youtube.com/watch?v=2lpQfQNglZM&t=396s
https://www.youtube.com/watch?v=ql9eHfb0Cmc&t=5370s
https://www.youtube.com/watch?v=LepF-pSByp0&t=7593s'),
('the-legend-of-zelda-oracle-of-ages-igdb-1041', 91, 'https://www.youtube.com/watch?v=GmUuE7QiFkA&t=1244s'),
('the-legend-of-zelda-oracle-of-seasons-igdb-1032', 91, 'https://www.youtube.com/watch?v=GmUuE7QiFkA&t=1244s'),
('the-legend-of-zelda-skyward-sword-igdb-534', 98, 'https://www.youtube.com/watch?v=l0Mwjb5jtW0&t=9378s
https://www.youtube.com/watch?v=4oVQvJ3Xn-0&t=4770s
https://www.youtube.com/watch?v=kM_XU4wv9t4&t=3111s'),
('the-legend-of-zelda-tears-of-the-kingdom', 95, 'https://www.youtube.com/watch?v=OxX1tabNaUw&t=304s
https://www.youtube.com/watch?v=2KYr62jtORQ&t=240s'),
('the-legend-of-zelda-the-minish-cap-igdb-1035', 95, 'https://www.youtube.com/watch?v=l0kSNYaokqE&t=7492s'),
('the-legend-of-zelda-the-wind-waker-igdb-1033', 94, 'https://www.youtube.com/watch?v=caWROOOTFn0&t=8056s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=851s
https://www.youtube.com/watch?v=BTuf8VEDTZk&t=3993s'),
('the-legend-of-zelda-twilight-princess-igdb-1036', 96, 'https://www.youtube.com/watch?v=FMBQUcTT2CY&t=422s
https://www.youtube.com/watch?v=GrHk_mNkgSI&t=851s
https://www.youtube.com/watch?v=uUQR9nXAITY&t=493s
https://www.youtube.com/watch?v=pGK1qv4QRfo&t=7140s'),
('the-witcher-igdb-80', 86, 'https://www.youtube.com/watch?v=kM_XU4wv9t4&t=2025s'),
('the-witcher-2-assassins-of-kings-igdb-478', 90, 'https://www.youtube.com/watch?v=399vFDRz6aA&t=2168s'),
('the-witcher-3-wild-hunt-igdb-1942', 97, 'https://www.youtube.com/watch?v=wuGrAtJu3ZI&t=1589s
https://www.youtube.com/watch?v=OxX1tabNaUw&t=289s
https://www.youtube.com/watch?v=GvQbVvZlH4w&t=3083s'),
('tom-clancy-s-splinter-cell-conviction-igdb-562', 85, 'https://www.youtube.com/watch?v=MQLDKJw4OVM&t=9528s'),
('tomb-raider-2-igdb-1164', 89, 'https://www.youtube.com/watch?v=1oACP9TUr68&t=1688s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=3840s'),
('ultimate-spider-man-igdb-4225', 83, 'https://www.youtube.com/watch?v=_s_BqROZqx0&t=1000s'),
('uncharted-2-among-thieves-igdb-565', 94, 'https://www.youtube.com/watch?v=2KYr62jtORQ&t=87s
https://www.youtube.com/watch?v=Q_XrazpfEAc&t=2150s'),
('uncharted-3-drake-s-deception-igdb-512', 88, 'https://www.youtube.com/watch?v=Q_XrazpfEAc&t=2936s
https://www.youtube.com/watch?v=H3NKzeMHfO0&t=92s'),
('uncharted-4-a-thief-s-end-igdb-7331', 93, 'https://www.youtube.com/watch?v=gZKvqb6gEBk&t=8530s
https://www.youtube.com/watch?v=200qyWFEg20&t=4620s'),
('uncharted-the-lost-legacy-igdb-26193', 75, 'https://www.youtube.com/watch?v=Q_XrazpfEAc&t=6093s'),
('xenoblade-chronicles-igdb-2364', 93, 'https://www.youtube.com/watch?v=Ja8LYReRjTM&t=2671s'),
('xenoblade-chronicles-3-igdb-191411', 90, 'https://www.youtube.com/watch?v=Q0BacibjlzQ&t=1616s'),
('x-men-origins-wolverine-igdb-573', 79, 'https://www.youtube.com/watch?v=FMBQUcTT2CY&t=215s
https://www.youtube.com/watch?v=5Fm-eHkYFus&t=1356s
https://www.youtube.com/watch?v=_s_BqROZqx0&t=1381s'),
('bioshock-2-igdb-21', 92, 'https://www.youtube.com/watch?v=yLM4pbEchJs&t=463s'),
('metroid-ii-return-of-samus-igdb-1102', 90, 'https://www.youtube.com/watch?v=8AbUg7QOvg4&t=497s'),
('the-legend-of-zelda-spirit-tracks-igdb-1038', 88, 'https://www.youtube.com/watch?v=GmUuE7QiFkA&t=2544s'),
('the-legend-of-zelda-phantom-hourglass-igdb-1037', 88, 'https://www.youtube.com/watch?v=GmUuE7QiFkA&t=2408s'),
('the-legend-of-zelda-echoes-of-wisdom-igdb-306149', 85, 'https://www.youtube.com/watch?v=GmUuE7QiFkA&t=3846s')
) as v(slug,score,review)
join public.games g on g.slug=v.slug
join public.profiles p on p.handle='tiempo_de_videojuegos' and p.owner_user_id is null
on conflict(profile_id,game_id) do nothing;
-- User-requested reference curation: completion is assumed, favorites and tiers derive from scores.
update public.ratings r
set tier=case when r.score>=95 then 'S' when r.score>=90 then 'A' when r.score>=80 then 'B' when r.score>=70 then 'C' when r.score>=50 then 'D' else 'F' end
from public.profiles p
where r.profile_id=p.id and p.handle='tiempo_de_videojuegos' and p.owner_user_id is null and r.score is not null;
insert into public.profile_favorites(profile_id,game_id)
select r.profile_id,r.game_id from public.ratings r join public.profiles p on p.id=r.profile_id
where p.handle='tiempo_de_videojuegos' and p.owner_user_id is null and r.score>=95
on conflict(profile_id,game_id) do nothing;
commit;
