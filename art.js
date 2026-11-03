/* Shared storybook art, zone data, goal logic and popup sheets.
   Everything is drawn as hand-lined SVG with a crayon filter so that
   town, rooms, items and UI share one picture-book look. */
(() => {
const KD = window.KD = {};
const INK = '#5a3a26';
const OL = 'stroke="'+INK+'" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
KD.OL = OL;
const OL4 = OL.replace('stroke-width="5"','stroke-width="4"');

/* ---------- global SVG filters (crayon wobble + paper grain) ---------- */
function installDefs(){
  if(document.getElementById('kd-defs'))return;
  const d=document.createElement('div');d.id='kd-defs';d.setAttribute('aria-hidden','true');
  d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML='<svg width="0" height="0"><defs>'+
   '<filter id="crayon" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter>'+
   '<filter id="crayon-s" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter>'+
   '<pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)"><path d="M0 3h9M3 10h8" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/><path d="M5 6h6" stroke="#6b4a2f" stroke-width="1.4" opacity=".12" stroke-linecap="round"/></pattern>'+
   '<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .34  0 0 0 0 .22  0 0 0 .22 0"/></filter>'+
   '<radialGradient id="glow"><stop offset="0" stop-color="#fffbd0" stop-opacity=".95"/><stop offset=".6" stop-color="#fff2a0" stop-opacity=".45"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="skyday" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#dff4fb"/></linearGradient>'+
   '<linearGradient id="skynight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a4d"/><stop offset=".7" stop-color="#2d3f86"/><stop offset="1" stop-color="#5a5fa6"/></linearGradient>'+
   '</defs></svg>';
  document.body.prepend(d);
}
if(document.body)installDefs();else document.addEventListener('DOMContentLoaded',installDefs);
KD.texture=(w,h)=>'<rect width="'+w+'" height="'+h+'" fill="url(#hatch)"/><rect width="'+w+'" height="'+h+'" filter="url(#paper)" opacity=".55"/>';

/* ---------- items ---------- */
const ITEM={
'にんぎょう':'<path d="M28 92L36 52H64L72 92Z" fill="#e96c79"/><path d="M36 60h28" stroke="#fff3c4" stroke-width="5"/><circle cx="50" cy="32" r="19" fill="#f8c18f"/><path d="M31 28q4-17 19-17t19 17q-8-7-19-6t-19 6" fill="#8b5a2b"/><circle cx="43" cy="32" r="2.4" fill="'+INK+'" stroke="none"/><circle cx="57" cy="32" r="2.4" fill="'+INK+'" stroke="none"/><path d="M43 40q7 6 14 0" fill="none"/><circle cx="38" cy="38" r="3.5" fill="#f49ab0" stroke="none"/><circle cx="62" cy="38" r="3.5" fill="#f49ab0" stroke="none"/><path d="M58 14l10-6 1 11Z" fill="#ffd34f"/>',
'ぶたいの ぬの':'<path d="M14 18q18-9 36 0t36 0v70q-18 8-36 0t-36 0Z" fill="#df5b69"/><path d="M26 24v62M50 22v66M74 24v62" stroke="#f8a8ad" stroke-width="6"/><path d="M14 18q18-9 36 0t36 0" fill="none" stroke="#ffd36a" stroke-width="7"/>',
'たいこ':'<path d="M17 32v42q33 22 66 0V32" fill="#e9a84e"/><ellipse cx="50" cy="32" rx="33" ry="12" fill="#f8ead0"/><path d="M22 44l56 32M78 44L22 76" stroke="#b66a39" stroke-width="5"/><path d="M60 10l18 16M40 8l-14 20" stroke="#8b5a2b" stroke-width="5"/><circle cx="79" cy="27" r="5" fill="#f2d18b"/><circle cx="25" cy="29" r="5" fill="#f2d18b"/>',
'しょうめい':'<path d="M64 26L94 10v76L64 64Z" fill="#fff6b5" stroke="none" opacity=".9"/><rect x="20" y="24" width="46" height="44" rx="10" fill="#f1d566"/><circle cx="58" cy="46" r="13" fill="#fffbe0"/><path d="M42 68v14M24 90h36" stroke="#776258" stroke-width="8"/>',
'にんじん':'<path d="M42 26L28 10M50 24V5M57 26L72 9" stroke="#4caa5e" stroke-width="9"/><path d="M33 29q17-10 35 0L50 92Z" fill="#f28d35"/><path d="M41 45l15 3M38 60l14 3M45 74l8 2" stroke="#d16c25" stroke-width="4"/>',
'じゃがいも':'<path d="M16 44q5-29 36-26 35 2 32 36-5 33-37 31-33 1-31-41" fill="#d8a469"/><circle cx="38" cy="40" r="3.5" fill="#aa734b"/><circle cx="64" cy="58" r="3.5" fill="#aa734b"/><circle cx="46" cy="66" r="3" fill="#aa734b"/><path d="M28 34q8-8 18-8" stroke="#f3cf9a" stroke-width="5" fill="none"/>',
'たまねぎ':'<path d="M48 8q-2 20-19 31Q8 60 28 82q21 16 44 0 19-23 0-43Q55 27 48 8Z" fill="#f4c77c"/><path d="M48 29q-21 30 0 56M50 29q20 29 0 56" fill="none" stroke="#dca15f" stroke-width="4"/><path d="M40 88l-6 6M50 90v6M60 88l6 6" stroke="#b58a5a" stroke-width="3"/>',
'カレールウ':'<rect x="14" y="20" width="72" height="62" rx="10" fill="#d77b40"/><rect x="24" y="30" width="52" height="26" rx="6" fill="#fff1b7"/><path d="M32 43h36" stroke="#d77b40" stroke-width="6"/><path d="M24 66h52" stroke="#f2bb71" stroke-width="6"/>',
'しお':'<rect x="28" y="30" width="44" height="56" rx="10" fill="#eef4f6"/><rect x="31" y="16" width="38" height="17" rx="5" fill="#70acc4"/><circle cx="42" cy="24" r="2" fill="#fff" stroke="none"/><circle cx="58" cy="24" r="2" fill="#fff" stroke="none"/><path d="M38 58h24" stroke="#8bc4d5" stroke-width="8"/>',
'みず':'<path d="M30 30h40l6 56H24Z" fill="#cdeefa"/><path d="M28 54h44l4 32H24Z" fill="#6bc4df"/><path d="M34 22h32v10H34Z" fill="#9fd2e6"/><path d="M38 64q4 6 0 12" stroke="#fff" stroke-width="4" fill="none"/>',
'さつまいも':'<path d="M14 62Q30 22 68 30q34 14 12 42Q50 92 14 62Z" fill="#a35c92"/><path d="M36 38q24-8 42 15" fill="none" stroke="#d890b1" stroke-width="5"/><path d="M80 34l12-8" stroke="#6a3d60" stroke-width="5"/>',
'火おこしどうぐ':'<path d="M22 78L72 28" stroke="#98633f" stroke-width="12"/><path d="M30 28L80 78" stroke="#b07a4f" stroke-width="12"/><path d="M48 60q-10-16 6-36 0 17 13 22 12 18-9 28Z" fill="#ef9c4b"/><path d="M53 62q-4-8 3-16 6 10 0 16Z" fill="#ffe27a" stroke="none"/>',
'まき':'<path d="M16 66L76 30M22 84L84 50" stroke="'+INK+'" stroke-width="20"/><path d="M16 66L76 30M22 84L84 50" stroke="#c18a52" stroke-width="12"/><circle cx="78" cy="30" r="9" fill="#eccb8f"/><circle cx="86" cy="50" r="9" fill="#eccb8f"/>',
'おなべ':'<path d="M18 42h64v30q-32 26-64 0Z" fill="#a7bbc5"/><ellipse cx="50" cy="41" rx="32" ry="9" fill="#e1e9df"/><path d="M18 52H6M82 52h12" stroke="#7d8387" stroke-width="8"/><path d="M30 60q20 8 40 0" stroke="#d6e2e6" stroke-width="5" fill="none"/>'
};
KD.item=(name,cls='kd-item')=>'<svg viewBox="0 0 100 100" class="'+cls+'" aria-hidden="true"><g filter="url(#crayon-s)" '+OL4+'>'+(ITEM[name]||'<circle cx="50" cy="50" r="33" fill="#f7d18b"/>')+'</g></svg>';
KD.ITEMS=Object.keys(ITEM);

/* ---------- small UI icons ---------- */
const ICON={
bag:'<path d="M26 34q0-22 24-22t24 22" fill="none" stroke-width="7"/><rect x="18" y="32" width="64" height="58" rx="16" fill="#f0a64a"/><rect x="30" y="54" width="40" height="22" rx="7" fill="#f7cf7c"/><path d="M50 54v8"/>',
book:'<path d="M50 24Q32 14 12 20v62q20-6 38 4 18-10 38-4V20q-20-6-38 4Z" fill="#7cc0e8"/><path d="M50 24v62"/><path d="M20 34q12-3 22 2M20 48q12-3 22 2M58 36q12-5 22-2M58 50q12-5 22-2" stroke-width="3"/>',
guide:'<circle cx="50" cy="50" r="38" fill="#fff4cf"/><path d="M50 18l12 32-12 32-12-32Z" fill="#ef6e6e"/><path d="M50 50l12 0-12 32-12-32Z" fill="#7ab4da"/><circle cx="50" cy="50" r="5" fill="'+INK+'"/>',
gear:'<path d="M44 10h12l3 12 10 5 11-6 8 9-6 11 4 10 12 3v12l-12 3-4 10 6 11-8 9-11-6-10 5-3 12H44l-3-12-10-5-11 6-8-9 6-11-4-10-12-3V44l12-3 4-10-6-11 8-9 11 6 10-5Z" fill="#8fc3de" transform="translate(50 50) scale(.8) translate(-50 -50)"/><circle cx="50" cy="50" r="13" fill="#fff6dc"/>',
home:'<path d="M14 50L50 18l36 32" fill="none" stroke-width="7"/><path d="M24 44v42h52V44L50 22Z" fill="#f6c76a"/><rect x="42" y="60" width="16" height="26" rx="4" fill="#c97845"/><path d="M14 50L50 18l36 32" fill="none" stroke="#e9675e" stroke-width="7"/>',
star:'<path d="M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3Z" fill="#ffd45a"/>',
moon:'<path d="M62 12a38 38 0 1 0 26 52A30 30 0 0 1 62 12Z" fill="#ffe28a"/><circle cx="24" cy="24" r="4" fill="#fff6c8"/><circle cx="80" cy="20" r="3" fill="#fff6c8"/>',
fire:'<path d="M50 8v24M50 68v24M8 50h24M68 50h24M21 21l17 17M62 62l17 17M79 21L62 38M38 62L21 79" stroke-width="11"/><path d="M50 8v24M50 68v24M8 50h24M68 50h24" stroke="#f47ca0" stroke-width="5"/><path d="M21 21l17 17M62 62l17 17M79 21L62 38M38 62L21 79" stroke="#58aee0" stroke-width="5"/><circle cx="50" cy="50" r="12" fill="#ffd45a"/>',
door:'<rect x="24" y="12" width="52" height="80" rx="24" fill="#c98a52"/><path d="M50 14v78" stroke-width="3"/><circle cx="60" cy="56" r="4" fill="#ffd45a"/>',
back:'<path d="M58 18L26 50l32 32" fill="none" stroke-width="12"/><path d="M58 18L26 50l32 32" fill="none" stroke="#fff6dc" stroke-width="5"/>',
close:'<circle cx="50" cy="50" r="40" fill="#7fb7dd"/><path d="M34 34l32 32M66 34L34 66" stroke="#fff" stroke-width="10"/>',
check:'<path d="M18 52l20 20 44-46" fill="none" stroke="#3f9a52" stroke-width="13"/><path d="M18 52l20 20 44-46" fill="none" stroke="#7fd08a" stroke-width="5"/>',
music:'<path d="M40 70V22l40-10v48" fill="none" stroke-width="7"/><ellipse cx="30" cy="72" rx="13" ry="10" fill="#f47ca0"/><ellipse cx="70" cy="62" rx="13" ry="10" fill="#f47ca0"/>',
mask:'<path d="M14 26q36-14 72 0-2 44-36 60Q16 70 14 26Z" fill="#ffd45a"/><path d="M28 42q7-6 14 0M58 42q7-6 14 0" fill="none"/><path d="M34 60q16 14 32 0" fill="#e9675e"/>',
camp:'<path d="M6 88h88" stroke="#7cc06a" stroke-width="9"/><path d="M14 86L46 26l40 60Z" fill="#7cc06a"/><path d="M46 26l40 60H62Z" fill="#5aa465"/><path d="M40 86l10-24 12 24Z" fill="#fff6dc"/><path d="M46 26V8" stroke-width="4"/><path d="M46 8l20 6-20 7Z" fill="#f47ca0" stroke-width="3"/>',
hand:'<path d="M40 88V40q0-8 7-8t7 8v20-30q0-8 7-8t7 8v32-22q0-7 7-7t6 7v34q0 24-22 24H50q-14 0-22-12L16 70q-4-8 3-11t12 3l9 10" fill="#f8c999"/>',
};
KD.icon=(name,cls='kd-icon')=>'<svg viewBox="0 0 100 100" class="'+cls+'" aria-hidden="true"><g '+OL+'>'+(ICON[name]||'')+'</g></svg>';

/* ---------- friends (NPC) ---------- */
function face(cx,cy,skin='#f8c999'){return '<circle cx="'+cx+'" cy="'+cy+'" r="24" fill="'+skin+'"/><path d="M'+(cx-12)+' '+(cy-2)+'q4-5 8 0M'+(cx+4)+' '+(cy-2)+'q4-5 8 0" fill="none" stroke-width="3.5"/><path d="M'+(cx-9)+' '+(cy+8)+'q9 11 18 0Z" fill="#d9555f" stroke-width="3.5"/><circle cx="'+(cx-15)+'" cy="'+(cy+6)+'" r="5" fill="#f49ab0" stroke="none"/><circle cx="'+(cx+15)+'" cy="'+(cy+6)+'" r="5" fill="#f49ab0" stroke="none"/>'}
const NPC={
boy:'<path d="M30 140l6-30h28l6 30Z" fill="#b98b52"/><path d="M28 112q0-36 22-36t22 36Z" fill="#6fb5e2"/><path d="M28 92l-12 20M72 92l12 20" stroke-width="9"/><path d="M28 92l-12 20M72 92l12 20" stroke="#f8c999" stroke-width="4"/>'+face(50,56)+'<path d="M24 46q4-26 26-26t26 26Z" fill="#7cc06a"/><path d="M20 46h44" stroke-width="6"/><path d="M28 46q6-6 10 0" fill="#8b5a2b" stroke="none"/>',
girl:'<path d="M26 138l8-34h32l8 34Z" fill="#f59bb5"/><path d="M30 110q0-34 20-34t20 34Z" fill="#ffe27a"/><path d="M30 92l-12 18M70 92l12 18" stroke-width="9"/><path d="M30 92l-12 18M70 92l12 18" stroke="#f8c999" stroke-width="4"/><path d="M22 60q-8 14 2 22M78 60q8 14-2 22" fill="none" stroke="#8b5a2b" stroke-width="10"/>'+face(50,56)+'<path d="M24 50q2-28 26-28t26 28q-26-12-52 0Z" fill="#ffd34f"/><path d="M74 40l12-4-4 12" fill="#ffd34f"/>',
uncle:'<path d="M28 140l4-46h36l4 46Z" fill="#5a8fc4"/><path d="M38 94h24v30H38Z" fill="#fff6dc" stroke-width="3"/><path d="M28 98l-10 22M72 98l10 22" stroke-width="9"/><path d="M28 98l-10 22M72 98l10 22" stroke="#f8c999" stroke-width="4"/><circle cx="50" cy="58" r="25" fill="#f8c999"/><circle cx="41" cy="54" r="7" fill="#fff" stroke-width="3"/><circle cx="59" cy="54" r="7" fill="#fff" stroke-width="3"/><circle cx="41" cy="54" r="2" fill="'+INK+'"/><circle cx="59" cy="54" r="2" fill="'+INK+'"/><path d="M36 68q7-6 14 0 7-6 14 0-7 6-14 2-7 4-14-2Z" fill="#f2f2f2" stroke-width="3"/><path d="M24 46q4-22 26-22t26 22q-26-6-52 0Z" fill="#8b8f99"/><circle cx="50" cy="22" r="4" fill="#8b8f99"/>',
auntie:'<path d="M26 140l8-46h32l8 46Z" fill="#9fcf8a"/><path d="M36 96h28v40H36Z" fill="#fbd3df" stroke-width="3"/><path d="M30 98l-12 20M70 98l12 20" stroke-width="9"/><path d="M30 98l-12 20M70 98l12 20" stroke="#f8c999" stroke-width="4"/>'+face(50,58)+'<path d="M25 52q0-28 25-28t25 28q-8-12-25-12t-25 12Z" fill="#6b4226"/><circle cx="50" cy="20" r="10" fill="#6b4226"/>'
};
KD.npc=(kind,cls='kd-npc')=>'<svg viewBox="0 0 100 145" class="'+cls+'" aria-hidden="true"><g filter="url(#crayon-s)" '+OL4+'>'+(NPC[kind]||NPC.boy)+'</g></svg>';

/* ---------- side-quest objects ---------- */
const QUEST={
hat:'<path d="M20 70q30 14 60 0l-8-8H28Z" fill="#7cc06a"/><path d="M30 64q0-30 20-30t20 30Z" fill="#f47ca0"/><path d="M30 56h40" stroke="#ffe27a" stroke-width="7"/>',
music:'<path d="M50 18q-22 0-24 36l-8 16h64l-8-16q-2-36-24-36Z" fill="#ffd45a"/><circle cx="50" cy="76" r="7" fill="#d79a2b"/><path d="M50 10v8"/>',
rain:'<path d="M50 14Q30 44 30 58a20 20 0 0 0 40 0q0-14-20-44Z" fill="#7ac8ea"/><path d="M40 56q0 10 8 12" stroke="#fff" stroke-width="4" fill="none"/>',
butterfly:'<path d="M50 30q-26-26-36 4t36 14q-26 6-20 26t20-14q14 34 22 14t-22-26q46 6 36-14T50 30Z" fill="#f59bb5"/><path d="M50 26v50" stroke-width="5"/><circle cx="34" cy="38" r="5" fill="#fff6c8"/><circle cx="66" cy="38" r="5" fill="#fff6c8"/>',
decor:'<path d="M50 8l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3Z" fill="#9fd2f2"/><path d="M50 30l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1Z" fill="#fff6c8" stroke-width="2"/>',
book:'<path d="M20 22l52-8 10 64-52 8Z" fill="#fff8e6"/><path d="M30 34l32-5M32 46l32-5M34 58l20-3" stroke-width="3"/><circle cx="62" cy="62" r="7" fill="#f47ca0" stroke-width="3"/>'
};
KD.quest=(id,cls='kd-quest')=>'<svg viewBox="0 0 100 100" class="'+cls+'" aria-hidden="true"><g filter="url(#crayon-s)" '+OL4+'>'+(QUEST[id]||QUEST.decor)+'</g></svg>';

/* ---------- zones ----------
   Scene coordinates: 600 x 1000 portrait. floor = walkable rect for feet.
   door = feet point in the TOWN (780x780 world) that enters; exit = where you reappear.
   sign = town sign anchor. Item spots and NPC are in scene coordinates.          */
KD.ZONES={
 theater:{name:'ドキドキ劇場',kana:'げきじょう',icon:'mask',door:[152,182],exit:[152,248],npc:['uncle',465,700],items:[[300,660]],quest:null,special:[300,615]},
 field:{name:'やさい畑',kana:'はたけ',icon:'camp',door:[366,196],exit:[372,262],npc:['boy',470,640],items:[[170,700],[310,760],[430,820]],quest:[120,560]},
 music:{name:'音楽ひろば',kana:'おんがくひろば',icon:'music',door:[628,170],exit:[612,236],npc:['boy',470,690],items:[[300,640],[160,740]],quest:[130,520]},
 shop:{name:'おみせ',kana:'おみせ',icon:'bag',door:[143,378],exit:[160,440],npc:['auntie',470,640],items:[[170,660],[300,640],[420,770],[200,790]],quest:[110,850]},
 tailor:{name:'仕立て屋さん',kana:'したてやさん',icon:'bag',door:[385,368],exit:[390,432],npc:['auntie',470,680],items:[[300,640]],quest:[130,520]},
 storage:{name:'まちの倉庫',kana:'そうこ',icon:'door',door:[615,378],exit:[560,440],npc:['uncle',470,700],items:[[190,690]],quest:null},
 craft:{name:'工作のおへや',kana:'こうさくのへや',icon:'gear',door:[133,615],exit:[175,680],npc:['girl',470,690],items:[[300,630]],quest:[110,520]},
 square:{name:'みんなの広場',kana:'みんなのひろば',icon:'camp',door:[385,560],exit:[385,488],npc:['girl',470,660],items:[[150,690],[300,780],[440,800],[180,850]],quest:[300,540]},
 forest:{name:'冒険の森',kana:'ぼうけんのもり',icon:'camp',door:[620,620],exit:[540,610],npc:['uncle',470,640],items:[[140,770]],quest:[480,500],special:[300,700]}
};
KD.LOC={'工作のおへや':'craft','仕立て屋':'tailor','音楽ひろば':'music','町の倉庫':'storage','畑':'field','お店':'shop','森':'forest','広場':'square'};
KD.zoneOfNeed=i=>i[1]==='たまねぎ'&&state.shortage?'square':KD.LOC[i[2]];
/* Where should the child go next? null = free play. */
KD.goal=()=>{
  const need=current().needs.find(i=>!state.items[i[1]]);
  if(state.chapter===0)return need?KD.zoneOfNeed(need):'theater';
  if(!state.done[1])return need?KD.zoneOfNeed(need):'forest';
  return null;
};
KD.nextNeed=()=>current().needs.find(i=>!state.items[i[1]]);
/* Items that live in this zone for the current chapter. */
KD.itemsIn=id=>{
  const list=current().needs.filter(i=>KD.LOC[i[2]]===id&&!(id==='shop'&&i[1]==='たまねぎ'&&state.shortage));
  if(id==='square'&&state.shortage&&current().needs.some(i=>i[1]==='たまねぎ'))list.push(['','たまねぎ','広場']);
  return list;
};
KD.LINES={
 theater:['こうえんが もうすぐ なのに、どうぐが たりないんだ！','にんぎょう、ぬの、たいこ、しょうめい。あつめてきて！','ぜんぶ そろったね！ ぶたいの まんなかへ どうぞ！','すてきな こうえんだったね。ありがとう！'],
 craft:['にんぎょうに リボンを つけたら できあがり！','つくるのって たのしいね！'],
 tailor:['ぶたいの ぬの、かしてあげる。おわったら かえしてね。','ぬいものも おもしろいよ。'],
 music:['たいこで あめの おとを ならそう。どん、どん！','おとが なると、こころが はずむね。'],
 storage:['しょうめいは たなの うえに あるよ。いっしょに はこぼう。','そうこには なんでも あるんだ。'],
 shop:['いらっしゃい！ すきな ものを もっていってね。','あれれ、たまねぎが きれちゃった。ひろばの なかまに きいてみて！','またね！'],
 field:['そだった やさいを わけてあげる！','はたけの つちは ふかふかだよ。'],
 square:['こまったときは みんなで かんがえよう！ おなべも かすよ。','たまねぎ？ あるよ、わけてあげる！','みんなで あつまると たのしいね。'],
 forest:['ひを つかうときは おとなと いっしょにね。','まきが たりないよ。もりで おちえだを ひろってきて！','ざいりょうが そろったね！ おなべの ところへ おいで。','よるの ほしが きれいだよ。ランタンの ところへ おいで。']
};
KD.npcLine=id=>{
  const L=KD.LINES[id]||['こんにちは！'];
  if(id==='theater')return state.chapter>0?L[3]:collected()===total()?L[2]:L[state.items['にんぎょう']?1:0];
  if(id==='shop')return state.shortage&&!state.items['たまねぎ']?L[1]:L[0];
  if(id==='square')return state.shortage&&!state.items['たまねぎ']?L[1]:L[0];
  if(id==='forest'){if(state.chapter<1)return L[0];if(state.done[1])return L[3];if(collected()===total())return L[2];if(!state.items['まき'])return L[1];return L[0];}
  return KD.itemsIn(id).some(i=>!state.items[i[1]])?L[0]:L[L.length-1];
};

/* ---------- popup sheet (storybook frame) ---------- */
let sheetEl=null,sheetClose=null;
KD.sheet=(html,{cls='',onClose=null,label='おしらせ',dismiss=true}={})=>{
  KD.closeSheet(true);
  const wrap=document.createElement('div');wrap.className='kd-backdrop';
  wrap.innerHTML='<section class="kd-sheet '+cls+'" role="dialog" aria-modal="true" aria-label="'+label+'">'+html+'</section>';
  wrap.addEventListener('pointerdown',e=>{if(dismiss&&e.target===wrap){e.preventDefault();KD.closeSheet()}});
  wrap.addEventListener('click',e=>{const c=e.target.closest('[data-close]');if(c){KD.closeSheet()}});
  (document.getElementById('app')||document.body).append(wrap);
  sheetEl=wrap;sheetClose=onClose;window.playGameSound?.('menu');
  requestAnimationFrame(()=>wrap.classList.add('open'));
  wrap.querySelector('button')?.focus({preventScroll:true});
  return wrap;
};
KD.closeSheet=(mode)=>{
  if(!sheetEl)return false;
  if(!sheetEl.isConnected){sheetEl=null;sheetClose=null;return false;}
  const w=sheetEl,fn=sheetClose;sheetEl=null;sheetClose=null;w.remove();
  if(mode!==true){if(mode!=='quiet')window.playGameSound?.('cancel');fn?.();}
  return true;
};
KD.sheetOpen=()=>Boolean(sheetEl&&sheetEl.isConnected);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&KD.sheetOpen()){e.preventDefault();KD.closeSheet()}});

/* ---------- a short toast near the top ---------- */
KD.toast=(html,ms=1800)=>{
  document.querySelectorAll('.kd-toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='kd-toast';t.setAttribute('role','status');t.innerHTML=html;
  (document.getElementById('app')||document.body).append(t);
  setTimeout(()=>t.classList.add('out'),ms);setTimeout(()=>t.remove(),ms+400);
};

/* ---------- "アイテムを ゲット！" card ---------- */
KD.gotItem=(name,after)=>{
  window.playGameSound?.('pickup');
  const s=KD.sheet('<div class="kd-ribbon">アイテムを ゲット！</div><div class="kd-got">'+KD.item(name,'kd-got-art')+'<span class="kd-rays" aria-hidden="true"></span></div><p class="kd-big"><b>'+name+'</b> を<br>てにいれた！</p><div class="kd-cheer">'+'<span class="kd-dragon-cheer" role="img" aria-label="子どもドラゴン"></span></div>',{cls:'got',label:name+'を てにいれた',onClose:after});
  const t=setTimeout(()=>{if(sheetEl===s)KD.closeSheet('quiet')},1900);
  s.addEventListener('pointerdown',()=>clearTimeout(t),{once:true});
  s.addEventListener('pointerup',()=>{if(sheetEl===s)KD.closeSheet('quiet')},{once:true});
};

/* ---------- mission card (pictures + checks) ---------- */
KD.needsGrid=(showPlace=true)=>'<ul class="kd-needs">'+current().needs.map(i=>{const got=state.items[i[1]];const z=KD.ZONES[KD.zoneOfNeed(i)];return '<li class="'+(got?'got':'')+'">'+KD.item(i[1])+(got?KD.icon('check','kd-check'):'')+'<b>'+i[1]+'</b>'+(showPlace&&!got&&z?'<small>'+z.kana+'</small>':'')+'</li>'}).join('')+'</ul>';
KD.bag=()=>{
  const m=current(),g=KD.goal();
  KD.sheet('<header class="kd-sheet-head">'+KD.icon('bag')+'<h2>もちもの</h2><button class="kd-x" data-close aria-label="とじる">'+KD.icon('close')+'</button></header><p class="kd-mission">'+m.name+'</p>'+KD.needsGrid()+
  '<div class="kd-row">'+(g&&screen==='map'?'<button class="kd-btn go" data-close onclick="KD.guideTo()">'+KD.icon('guide')+'あんない</button>':'')+(state.chapter===1&&!state.done[1]?'<button class="kd-btn" onclick="KD.closeSheet(true);show(\'cook\')">'+KD.icon('camp')+'りょうりを かえる</button>':'')+'</div>',{label:'もちもの'});
};
KD.guideTo=()=>{const g=KD.goal();if(!g){KD.toast('すきな ところへ いってみよう！');return}if(screen!=='map'){show('map')}setTimeout(()=>window.visit?.(g),60)};
})();
