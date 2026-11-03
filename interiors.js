/* Explorable illustrated zones. Items, friends and side-quests live IN the picture;
   the dragon walks to them (d-pad or tap) and picks them up by touching them. */
(()=>{
const previous=render;
const W=600,H=1000,FLOOR={x0:60,x1:540,y0:650,y1:890},EXIT=[300,915];
const O='stroke="#5a3a26" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
/* ---------- drawing helpers (600x1000 portrait) ---------- */
const g=(s)=>`<g filter="url(#crayon)" ${O}>${s}</g>`;
function room(wall,stripe,floor,seam){let p=`<rect x="-10" y="-10" width="620" height="590" fill="${wall}" stroke="none"/>`;
 for(let x=30;x<600;x+=60)p+=`<path d="M${x} 0V560" stroke="${stripe}" stroke-width="18" opacity=".55"/>`;
 p+=`<path d="M-10 560H610V1010H-10Z" fill="${floor}"/>`;
 for(let k=-6;k<=6;k++)p+=`<path d="M${300+k*60} 560L${300+k*120} 1000" stroke="${seam}" stroke-width="3" opacity=".7"/>`;
 for(const y of [640,750,890])p+=`<path d="M0 ${y}H600" stroke="${seam}" stroke-width="2" opacity=".5"/>`;
 return p+`<rect x="-10" y="540" width="620" height="26" fill="${seam}"/>`}
const win=(x,y,w,h,curt='#f59bb5')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#9fdcf6"/><path d="M${x+w*.2} ${y+h*.35}q15-18 32-4 14-12 28 2 16 0 14 14H${x+w*.2}Z" fill="#fff" stroke-width="3"/><path d="M${x+w/2} ${y}V${y+h}M${x} ${y+h/2}H${x+w}" stroke-width="7"/><rect x="${x-12}" y="${y+h}" width="${w+24}" height="16" rx="5" fill="#d9a466"/><path d="M${x-14} ${y-8}q${w*.25} ${h*.6} 6 ${h*.8}L${x-14} ${y+h}ZM${x+w+14} ${y-8}q${-w*.25} ${h*.6} -6 ${h*.8}L${x+w+14} ${y+h}Z" fill="${curt}"/>`;
const shelf=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="16" rx="4" fill="#c98a52"/><path d="M${x+14} ${y+16}l10 22M${x+w-14} ${y+16}l-10 22" stroke-width="6"/>`;
const books=(x,y,n=5)=>{let s='';const c=['#e9675e','#58aee0','#ffd45a','#7cc06a','#b38ad6','#f6a23c'];for(let i=0;i<n;i++){const h=46+(i*13)%22;s+=`<rect x="${x+i*20}" y="${y-h}" width="18" height="${h}" rx="3" fill="${c[i%6]}" stroke-width="3.5"/>`}return s};
const jar=(x,y,c)=>`<rect x="${x-16}" y="${y-44}" width="32" height="44" rx="9" fill="${c}" stroke-width="3.5"/><rect x="${x-18}" y="${y-52}" width="36" height="12" rx="4" fill="#f5e7c8" stroke-width="3.5"/>`;
const table=(x,y,w,c='#d9a466')=>`<path d="M${x+18} ${y+20}V${y+110}M${x+w-18} ${y+20}V${y+110}" stroke-width="12"/><path d="M${x+18} ${y+20}V${y+110}M${x+w-18} ${y+20}V${y+110}" stroke="${c}" stroke-width="5"/><rect x="${x}" y="${y}" width="${w}" height="26" rx="8" fill="${c}"/><path d="M${x+10} ${y+9}H${x+w*.4}" stroke="#fff3d6" stroke-width="4"/>`;
const plant=(x,y)=>`<path d="M${x-22} ${y-40}h44l-6 40h-32Z" fill="#e9875e"/><path d="M${x} ${y-40}q-30-40-6-70M${x} ${y-40}q26-30 10-66M${x} ${y-40}q-8-30 0-50" fill="none" stroke="#3f8a4e" stroke-width="6"/><circle cx="${x-6}" cy="${y-108}" r="13" fill="#7cc06a" stroke-width="3"/><circle cx="${x+10}" cy="${y-104}" r="13" fill="#7cc06a" stroke-width="3"/>`;
const lamp=(x,len=80)=>`<path d="M${x} 0V${len}" stroke-width="3"/><circle cx="${x}" cy="${len+34}" r="44" fill="url(#glow)" stroke="none"/><path d="M${x-26} ${len+26}q26-36 52 0Z" fill="#ffd45a"/><circle cx="${x}" cy="${len+30}" r="8" fill="#fffbe0" stroke-width="3"/>`;
const bunting=(y,cs=['#f47ca0','#ffd45a','#58aee0','#7cc06a','#f6a23c'])=>{let s=`<path d="M-10 ${y}Q300 ${y+60} 610 ${y}" fill="none" stroke-width="3"/>`;for(let i=0;i<11;i++){const x=10+i*56,yy=y+Math.sin(i/10*Math.PI)*30;s+=`<path d="M${x} ${yy}l40 4-22 34Z" fill="${cs[i%cs.length]}" stroke-width="3"/>`}return s};
const crate=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d9a466"/><path d="M${x} ${y}L${x+w} ${y+h}M${x+w} ${y}L${x} ${y+h}" stroke-width="4"/><rect x="${x+8}" y="${y+8}" width="${w-16}" height="${h-16}" fill="none" stroke-width="3"/>`;
const barrel=(x,y)=>`<path d="M${x-36} ${y-90}q-10 45 0 90h72q10-45 0-90Z" fill="#b97845"/><path d="M${x-40} ${y-64}h80M${x-40} ${y-26}h80" stroke-width="7"/><ellipse cx="${x}" cy="${y-90}" rx="36" ry="10" fill="#d9a466"/>`;
const sky=(h=560)=>`<rect x="-10" y="-10" width="620" height="${h+10}" fill="url(#skyday)" stroke="none"/><path d="M60 120q20-30 50-12 20-24 48 0 30-6 30 22H50q-10-12 10-10Z" fill="#fff" stroke-width="3"/><path d="M380 70q18-26 44-10 18-20 42 0 26-4 26 20H370q-8-10 10-10Z" fill="#fff" stroke-width="3"/>`;
const tree=(x,y,s=1,c='#6fb85c')=>`<path d="M${x} ${y}V${y-110*s}" stroke-width="${16*s}"/><path d="M${x} ${y}V${y-110*s}" stroke="#a7703f" stroke-width="${8*s}"/><circle cx="${x}" cy="${y-150*s}" r="${62*s}" fill="${c}"/><circle cx="${x-46*s}" cy="${y-110*s}" r="${40*s}" fill="${c}"/><circle cx="${x+46*s}" cy="${y-112*s}" r="${42*s}" fill="${c}"/><path d="M${x-26*s} ${y-176*s}q14-14 30-6" fill="none" stroke="#b6e19a" stroke-width="5"/>`;
const flowers=(x,y)=>{let s='';[['#f47ca0',0,0],['#ffd45a',22,8],['#b38ad6',-18,12],['#fff',8,22]].forEach(([c,dx,dy])=>{s+=`<path d="M${x+dx} ${y+dy}v18" stroke="#3f8a4e" stroke-width="3"/><circle cx="${x+dx}" cy="${y+dy}" r="8" fill="${c}" stroke-width="3"/><circle cx="${x+dx}" cy="${y+dy}" r="3" fill="#f6a23c" stroke="none"/>`});return s};
const ground=(c1,c2)=>`<path d="M-10 470Q150 430 300 460T610 450V1010H-10Z" fill="${c1}"/><path d="M220 1010Q260 760 300 600Q340 760 380 1010Z" fill="${c2}" stroke="none" opacity=".8"/>`;
const hills=()=>`<path d="M-10 480Q100 330 240 430T470 400T610 430V560H-10Z" fill="#9fd38a"/>`;
const tent=(x,y,w,c)=>`<path d="M${x-w/2} ${y}L${x} ${y-w*.8}L${x+w/2} ${y}Z" fill="${c}"/><path d="M${x-w*.14} ${y}L${x} ${y-w*.42}L${x+w*.14} ${y}Z" fill="#a9643d"/><path d="M${x} ${y-w*.8}v-20" stroke-width="4"/><path d="M${x} ${y-w*.8-20}l24 8-24 8" fill="#f47ca0" stroke-width="3"/>`;
const fire=(x,y)=>`<path d="M${x-50} ${y}l100-22M${x-50} ${y-22}l100 22" stroke-width="16"/><path d="M${x-50} ${y}l100-22M${x-50} ${y-22}l100 22" stroke="#a7703f" stroke-width="9"/><path d="M${x} ${y-14}q-30-40 0-90 4 30 22 40 12 30-22 50Z" fill="#ef9c4b" class="flame"/><path d="M${x+2} ${y-18}q-12-20 2-44 12 24 0 44Z" fill="#ffe27a" stroke-width="3"/>`;
const SCENES={
theater:{svg:()=>`<rect x="-10" y="-10" width="620" height="600" fill="#7d3c46" stroke="none"/>`+g(`<path d="M0 560H600V1010H0Z" fill="#9a6a45"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${i*80-20} 560L${i*100-50} 1000" stroke="#7a5232" stroke-width="3"/>`).join('')}
 <rect x="40" y="60" width="520" height="430" fill="#3a2a4a"/><path d="M80 470Q120 300 180 260T300 200T420 260T520 470Z" fill="#7cbfd8" stroke="none"/><path d="M240 330h120v140H240Z" fill="#f2e6c8"/><path d="M226 330l74-60 74 60ZM260 380h24v40h-24ZM316 380h24v40h-24Z" fill="#e9a3b8"/><path d="M200 400h30v70h-30ZM370 400h30v70h-30Z" fill="#f2e6c8"/><path d="M196 400l19-30 19 30M366 400l19-30 19 30" fill="#e9675e"/>
 <path d="M30 470H570L600 600H0Z" fill="#d9a466"/><path d="M0 600H600" stroke-width="7"/>${[1,2,3,4,5].map(i=>`<path d="M${i*100} 470l${(i-3)*12} 130" stroke="#b07a48" stroke-width="3"/>`).join('')}
 <path d="M20 40q90 120 60 430L20 480Z" fill="#d94b5c"/><path d="M580 40q-90 120-60 430l60 10Z" fill="#d94b5c"/><path d="M20 40H580V100Q450 140 300 104T20 100Z" fill="#e85e6e"/><path d="M60 52v100M120 54v80M480 54v80M540 52v100" stroke="#f3a1a8" stroke-width="5"/><path d="M20 98Q160 140 300 104T580 98" fill="none" stroke="#ffd45a" stroke-width="10"/>
 <circle cx="300" cy="54" r="22" fill="#ffd45a"/><path d="M286 50q6-8 12 0M302 50q6-8 12 0M288 62q12 10 24 0" fill="none" stroke-width="3"/>
 ${lamp(130,20)}${lamp(470,20)}
 <path d="M24 600V860M64 600V860M24 640h40M24 700h40M24 760h40M24 820h40" stroke-width="6"/>
 <path d="M496 640h80M506 640v120M566 640v120" stroke-width="6"/><path d="M510 650l18 70h22l18-70Z" fill="#b38ad6"/><path d="M548 650l12 60" stroke-width="3"/>
 ${crate(470,880,90,70)}<path d="M0 960h600" stroke-width="30" stroke="#7a2f3a"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${i*96-10} 990q38-40 76 0" fill="#c84c5c"/>`).join('')}`),npc:['uncle',480,780],special:[300,700]},
craft:{svg:()=>g(room('#ffe9a6','#fff3c4','#d9b07a','#a87a4a')+win(60,120,180,190,'#b38ad6')+
 `<path d="M128 170l44 44M172 170l-44 44" stroke="#b38ad6" stroke-width="10"/>`+bunting(30)+shelf(340,190,220)+books(352,190,6)+shelf(340,330,220)+jar(370,330,'#58aee0')+jar(420,330,'#f47ca0')+jar(470,330,'#7cc06a')+
 `<path d="M520 330v-60M512 330l8-70 8 70" stroke-width="4"/><path d="M505 268l30-14" stroke="#f6a23c" stroke-width="8"/>`+shelf(340,460,220)+`<rect x="360" y="418" width="70" height="42" rx="6" fill="#f59bb5" stroke-width="3.5"/><rect x="440" y="404" width="56" height="56" rx="6" fill="#9fd2f2" stroke-width="3.5"/>`+
 table(140,560,320)+`<rect x="160" y="540" width="60" height="22" rx="3" fill="#ff9fb5" transform="rotate(-8 190 550)" stroke-width="3"/><rect x="370" y="536" width="70" height="26" rx="3" fill="#9fdcf6" transform="rotate(6 400 550)" stroke-width="3"/>`+plant(560,650)+
 `<ellipse cx="300" cy="820" rx="230" ry="66" fill="#f6c6d4"/><ellipse cx="300" cy="820" rx="170" ry="44" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="14 12"/>`),
 items:[[300,566]],npc:['girl',470,790],quest:[470,190]},
tailor:{svg:()=>g(room('#fbd3df','#fde6ee','#d4a576','#a57449')+shelf(30,170,250)+[0,1,2,3].map(i=>`<rect x="${44+i*58}" y="96" width="48" height="74" rx="22" fill="${['#e9675e','#58aee0','#ffd45a','#7cc06a'][i]}" stroke-width="4"/><ellipse cx="${68+i*58}" cy="104" rx="20" ry="8" fill="#fff6e0" stroke-width="3"/>`).join('')+shelf(30,320,250)+[0,1,2,3,4].map(i=>`<circle cx="${60+i*48}" cy="298" r="20" fill="${['#f47ca0','#b38ad6','#58aee0','#f6a23c','#7cc06a'][i]}" stroke-width="3.5"/><circle cx="${60+i*48}" cy="298" r="6" fill="#fff6e0" stroke-width="2"/>`).join('')+
 `<path d="M340 200H580M356 200v360M566 200v360" stroke-width="8"/>`+[0,1,2].map(i=>`<path d="M${390+i*62} 205v18" stroke-width="3"/><path d="M${366+i*62} 226h48l12 120h-72Z" fill="${['#f47ca0','#7cc06a','#ffd45a'][i]}"/><path d="M${376+i*62} 226q14 18 28 0" fill="none" stroke-width="3"/>`).join('')+
 `<path d="M140 440q0-50 40-60h20q40 10 40 60v80h-100Z" fill="#fff0d0"/><path d="M190 380v-30" stroke-width="6"/><circle cx="190" cy="346" r="12" fill="#c98a52"/>`+
 table(160,570,300)+`<path d="M190 570v-60h80v24h-50v36Z" fill="#7cbfd8"/><circle cx="252" cy="520" r="8" fill="#ffd45a" stroke-width="3"/><path d="M220 520v30" stroke-width="3"/>`+
 `<ellipse cx="300" cy="830" rx="220" ry="60" fill="#fff0d0"/><path d="M110 830h380" stroke="#f59bb5" stroke-width="6" stroke-dasharray="16 14"/>`),
 items:[[360,576]],npc:['auntie',110,790],quest:null},
music:{svg:()=>g(room('#ffe0b3','#fff0d5','#cf9f6c','#9c6f45')+win(40,110,170,180,'#7cc06a')+
 `<path d="M300 90v120l60-14V80Z" fill="none" stroke-width="7"/><ellipse cx="290" cy="212" rx="16" ry="12" fill="#f47ca0"/><ellipse cx="350" cy="198" rx="16" ry="12" fill="#58aee0"/>`+
 `<path d="M470 120l60 40" stroke-width="14"/><path d="M478 140q-40 30-16 80 30 50 76 26 34-20 16-66-20-50-76-40Z" fill="#f6a23c"/><circle cx="502" cy="200" r="16" fill="#5a3a26"/><path d="M520 70l-30 60" stroke-width="10"/>`+
 `<ellipse cx="110" cy="560" rx="70" ry="22" fill="#e9675e"/><path d="M40 560v60q70 30 140 0v-60" fill="#e9675e"/><ellipse cx="110" cy="560" rx="70" ry="22" fill="#fff6e0"/><path d="M60 600h100" stroke="#ffd45a" stroke-width="6"/><path d="M60 620l-16 60M160 620l16 60" stroke-width="6"/>`+
 `<path d="M520 470V650M480 650h80M470 470l50-60 50 60Z" fill="#fff6e0"/><path d="M490 440h60M490 456h60" stroke-width="3"/>`+
 `<rect x="250" y="600" width="100" height="18" rx="6" fill="#c98a52"/><path d="M262 618l-12 80M338 618l12 80" stroke-width="8"/>`+
 `<ellipse cx="480" cy="565" rx="34" ry="10" fill="#c98a52"/><path d="M480 575v90" stroke-width="7"/>`+
 `<ellipse cx="300" cy="820" rx="230" ry="62" fill="#ffe27a"/>`+[0,1,2,3].map(i=>`<path d="M${180+i*80} 812l10-22v26" fill="none" stroke-width="5"/><circle cx="${180+i*80}" cy="816" r="7" fill="#5a3a26"/>`).join('')),
 items:[[300,606],[140,566]],npc:['boy',470,800],quest:[480,566]},
storage:{svg:()=>g(`<rect x="-10" y="-10" width="620" height="590" fill="#b98a5c" stroke="none"/>`+[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*64} 0V560" stroke="#8b6239" stroke-width="4"/>`).join('')+room('none','none','#c9a273','#8b6239').replace('<rect x="-10" y="-10" width="620" height="590" fill="none" stroke="none"/>','')+
 lamp(300,40)+shelf(30,250,540)+crate(50,170,90,80)+crate(150,190,70,60)+barrel(300,250)+crate(380,180,80,70)+crate(470,200,80,50)+shelf(30,420,540)+jar(80,420,'#9fd2f2')+jar(130,420,'#ffd45a')+`<path d="M200 420v-70h60v70" fill="#7cc06a"/><path d="M380 420l20-80h40l20 80Z" fill="#e9675e"/>`+
 crate(110,560,150,110)+barrel(500,660)+`<path d="M560 560L600 300M580 560l20-260" stroke-width="7"/>`+[0,1,2,3,4].map(i=>`<path d="M${560+i*8} ${520-i*50}h28" stroke-width="5"/>`).join('')+
 `<path d="M210 900q90-30 180 0" fill="none" stroke="#8b6239" stroke-width="5" stroke-dasharray="12 12"/>`),
 items:[[185,566]],npc:['uncle',470,790],quest:null},
shop:{svg:()=>g(room('#fff0bd','#fff7d8','#e1b47c','#a87a4a')+`<path d="M-10 0H610V70H-10Z" fill="#fff"/>`+[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*64-10} 0h32v70q-16 26-32 0Z" fill="#e9675e"/>`).join('')+`<path d="M-10 70q32 26 64 0t64 0 64 0 64 0 64 0 64 0 64 0 64 0 64 0 64 0" fill="none" stroke-width="4"/>`+
 `<rect x="200" y="100" width="200" height="60" rx="14" fill="#ffd45a"/><circle cx="300" cy="130" r="20" fill="#f6a23c"/><path d="M290 130h20" stroke-width="4"/>`+
 shelf(30,300,250)+`<path d="M40 300q35-50 70 0Z" fill="#7cc06a"/><path d="M130 300q40-40 80 0Z" fill="#f28d35"/>`+[0,1,2].map(i=>`<circle cx="${150+i*22}" cy="${284-i*6}" r="12" fill="#f28d35" stroke-width="3"/>`).join('')+
 `<path d="M30 460h250v26H30Z" fill="#c98a52"/><path d="M50 460q-6-40 20-40h60q26 0 20 40Z" fill="#d9a466"/><path d="M160 460q-6-40 20-40h60q26 0 20 40Z" fill="#d9a466"/><path d="M60 486v120M250 486v120" stroke-width="8"/>`+
 `<rect x="340" y="606" width="220" height="110" rx="10" fill="#c98a52"/><rect x="340" y="596" width="220" height="24" rx="8" fill="#e8b878"/><path d="M360 650h180" stroke="#a46a3c" stroke-width="5"/>`+
 `<rect x="470" y="530" width="80" height="66" rx="8" fill="#9fd2f2"/><rect x="484" y="542" width="52" height="20" rx="4" fill="#fff" stroke-width="3"/>`+
 shelf(330,300,240)+jar(370,300,'#fff')+jar(420,300,'#e9675e')+jar(470,300,'#ffd45a')+jar(520,300,'#7cc06a')+plant(560,560)+
 `<rect x="60" y="760" width="110" height="70" rx="12" fill="#f6c87a"/><path d="M60 790h110" stroke-width="4"/>`),
 items:[[90,462],[440,602],[520,602],[200,462]],npc:['auntie',470,790],quest:[110,860]},
field:{svg:()=>g(sky()+hills()+tree(60,470,.8)+tree(560,460,.9,'#5aa465')+`<path d="M-10 480h620" stroke="none"/>`+ground('#a8d48a','#d9b07a')+
 `<path d="M60 540h480" stroke-width="5"/>`+[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M${70+i*58} 520v36" stroke-width="7"/>`).join('')+
 [0,1,2].map(r=>`<path d="M-10 ${680+r*90}Q300 ${650+r*90} 610 ${680+r*90}" stroke="#a46a3c" stroke-width="40" fill="none"/>`+[0,1,2,3,4,5].map(i=>`<path d="M${50+i*100} ${670+r*90-(i%2)*4}q-10-26 6-34M${50+i*100} ${670+r*90}q10-24 -2-36" fill="none" stroke="#3f8a4e" stroke-width="7"/>`).join('')).join('')+
 `<path d="M520 520v-120M480 440h80" stroke-width="9"/><circle cx="520" cy="384" r="24" fill="#f8c999"/><path d="M490 376q30-34 60 0Z" fill="#ffd45a"/><path d="M490 440l30 50 30-50Z" fill="#e9675e"/>`+flowers(100,560)+flowers(420,575)),
 items:[[150,690],[300,770],[450,860]],npc:['boy',490,640],quest:[120,600]},
square:{svg:()=>g(sky(480)+tree(40,460,.7)+tree(570,450,.75,'#5aa465')+ground('#b9dd96','#ecd3a0')+bunting(70)+
 `<path d="M130 520L300 230L470 520Z" fill="#58aee0"/><path d="M180 520L300 230L420 520Z" fill="#ffd45a"/><path d="M240 520L300 230L360 520Z" fill="#58aee0"/><path d="M270 520l30-90 30 90Z" fill="#a9643d"/><path d="M300 230v-40" stroke-width="5"/><path d="M300 190l30 10-30 10" fill="#f47ca0" stroke-width="3"/>`+
 tent(80,600,140,'#ffd45a')+tent(520,600,140,'#ffd45a')+
 `<path d="M60 680h120M70 680v30M170 680v30" stroke-width="8"/><path d="M60 672h120" stroke="#c98a52" stroke-width="12"/>`+
 `<path d="M420 690h130M430 690v28M540 690v28" stroke-width="8"/><path d="M420 682h130" stroke="#c98a52" stroke-width="12"/>`+
 `<rect x="250" y="745" width="100" height="18" rx="6" fill="#c98a52"/><path d="M262 763v40M338 763v40" stroke-width="7"/>`+flowers(40,860)+flowers(540,880)),
 items:[[120,670],[300,750],[480,684],[200,870]],npc:['girl',470,830],quest:[300,600]},
forest:{svg:()=>g(sky(520)+tree(40,500,1.1,'#4f9c5e')+tree(170,470,.8,'#5aa465')+tree(440,470,.85,'#4f9c5e')+tree(570,500,1.1,'#5aa465')+ground('#9fcf80','#d9b07a')+
 tent(130,640,190,'#f5c04e')+tent(480,600,170,'#f2a65a')+
 `<path d="M230 700L300 560L370 700" fill="none" stroke-width="8"/>`+fire(300,720)+`<path d="M300 560v40" stroke-width="4"/><path d="M262 600h76v40q-38 26-76 0Z" fill="#8d9aa3"/><ellipse cx="300" cy="600" rx="38" ry="10" fill="#c7d3d9"/>`+
 `<path d="M60 800h110" stroke-width="22"/><path d="M60 800h110" stroke="#a7703f" stroke-width="14"/><path d="M420 830h120" stroke-width="22"/><path d="M420 830h120" stroke="#a7703f" stroke-width="14"/>`+
 `<path d="M60 700v-70M30 640h80l12 14-12 14H30Z" fill="#f3cf93"/>`+
 `<path d="M560 700v-60M546 640h28v-30h-28Z" fill="#ffd45a"/><circle cx="560" cy="625" r="30" fill="url(#glow)" stroke="none"/>`),
 items:[[90,760]],npc:['uncle',500,810],quest:[480,560],special:[300,790]}
};
const SIDE={craft:'hat',music:'music',forest:'rain',field:'butterfly',square:'decor',shop:'book'};
/* ---------- state for the open room ---------- */
let id=null,actorX=300,actorY=840,facing='up',held=new Set(),target=null,pending=null,raf=0,last=0,walkT=0,active=false,armed=false,layer=null,scale=1,offX=0,offY=0,lock=0,talkTimer=0;
const rows={down:0,left:1,right:2,up:3};
const clampX=x=>Math.max(FLOOR.x0,Math.min(FLOOR.x1,x)),clampY=y=>Math.max(FLOOR.y0,Math.min(FLOOR.y1,y));
const reachOf=([x,y])=>[clampX(x),clampY(y+70)];
function items(){return KD.itemsIn(id).map((it,i)=>({name:it[1],pos:(SCENES[id].items||[[300,700]])[i%(SCENES[id].items||[1]).length]}))}
function quest(){const qid=SIDE[id];if(!qid||!SCENES[id].quest||state.side[qid])return null;return sideQuests.find(q=>q.id===qid)}
function specialState(){if(id==='theater')return state.chapter===0&&collected()===total()?'stage':null;
 if(id==='forest'&&state.chapter===1)return state.done[1]?'stars':collected()===total()?'mix':null;return null}
function msg(t){const n=document.getElementById('room-message');if(n){n.textContent=t;n.classList.remove('flash');void n.offsetWidth;n.classList.add('flash')}}
function npcSay(t,ms=3600){const box=document.getElementById('room-talk'),b=document.getElementById('room-npc-bubble');if(!box)return;b.textContent=t;box.hidden=false;box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop');clearTimeout(talkTimer);talkTimer=setTimeout(()=>{box.hidden=true},ms);say(t)}
function objective(){
 const list=items(),g=KD.goal();
 if(list.length)return '<div class="room-objective" aria-label="ここで さがすもの">'+list.map(it=>'<span class="hud-slot '+(state.items[it.name]?'got':'')+'">'+KD.item(it.name)+(state.items[it.name]?KD.icon('check','kd-check'):'')+'</span>').join('')+'</div>';
 if(g&&g!==id)return '<div class="room-objective next">つぎは <b>'+KD.ZONES[g].kana+'</b> '+KD.icon('door')+'</div>';
 return '';
}
function build(){
 const sc=SCENES[id],z=KD.ZONES[id],sp=specialState(),q=quest();
 const html='<main class="room-game" data-zone="'+id+'"><div class="room-stage" id="room-stage"><div class="room-world" id="room-world">'+
  '<svg class="room-backdrop" viewBox="0 0 600 1000" aria-hidden="true">'+sc.svg()+KD.texture(600,1000)+'</svg>'+
  (sc.special?'<button class="room-special'+(sp?' on':'')+'" data-sfx="none" style="left:'+sc.special[0]+'px;top:'+sc.special[1]+'px" onclick="roomTap(\'special\')" aria-label="'+(sp==='stage'?'ぶたいへ':sp==='mix'?'おりょうり':sp==='stars'?'ほしぞら':'')+'"'+(sp?'':' disabled')+'><span></span></button>':'')+
  items().map((it,i)=>state.items[it.name]?'':'<button class="room-pickup" data-sfx="none" data-i="'+i+'" style="left:'+it.pos[0]+'px;top:'+it.pos[1]+'px;z-index:'+Math.round(it.pos[1])+'" onclick="roomTap(\'item\','+i+')" aria-label="'+it.name+'">'+KD.item(it.name)+'</button>').join('')+
  (q?'<button class="room-quest" data-sfx="none" style="left:'+sc.quest[0]+'px;top:'+sc.quest[1]+'px;z-index:'+sc.quest[1]+'" onclick="roomTap(\'quest\')" aria-label="'+q.title+'">'+KD.quest(q.id)+'<i>？</i></button>':'')+
  '<button class="room-npc" data-sfx="none" style="left:'+sc.npc[1]+'px;top:'+sc.npc[2]+'px;z-index:'+sc.npc[2]+'" onclick="roomTap(\'npc\')" aria-label="なかまと はなす">'+KD.npc(sc.npc[0])+'</button>'+
  '<div id="room-actor" class="room-actor"><span class="walker-shadow"></span><span class="room-sprite" role="img" aria-label="子どもドラゴン"></span></div>'+
  '</div>'+
  '<header class="room-header"><button class="room-back" onclick="roomLeave()" data-sfx="none" aria-label="まちへ もどる">'+KD.icon('back')+'<span>まち</span></button><strong class="room-sign">'+KD.icon(z.icon)+z.kana+'</strong><button class="room-bag" onclick="KD.bag()" aria-label="もちもの">'+KD.icon('bag')+'</button></header>'+
  objective()+
  '<div class="room-controls game-controls"><div class="dpad" role="group" aria-label="いどう">'+[['up','うえ'],['left','ひだり'],['right','みぎ'],['down','した']].map(([d,n])=>'<button class="pad-key room-direction '+d+'" data-dir="'+d+'" data-sfx="none" aria-label="'+n+'へ あるく"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 9L32 27H8Z"/></svg></button>').join('')+'<span class="pad-center"></span></div>'+
  '<div class="action-pad"><button class="action-button b-button" data-sfx="none" onclick="roomB()" aria-label="B もどる"><b>B</b><small>もどる</small></button><button class="action-button a-button" id="room-a" data-sfx="none" onclick="roomA()" aria-label="A しらべる"><b>A</b><small>しらべる</small></button></div></div>'+
  '<div class="room-talk" id="room-talk" hidden><span class="talk-face">'+KD.npc(sc.npc[0])+'</span><p id="room-npc-bubble"></p></div>'+
  '<p class="room-dialogue" id="room-message" role="status" aria-live="polite"></p>'+
  '</div></main>';
 el(html);
}
function fit(){const st=document.getElementById('room-stage');layer=document.getElementById('room-world');if(!st||!layer)return;const w=st.clientWidth,h=st.clientHeight;scale=Math.max(w/W,h/H);offX=(w-W*scale)/2;offY=Math.min(0,Math.max(h-H*scale,(h-H*scale)*.35));layer.style.transform='translate('+offX+'px,'+offY+'px) scale('+scale+')'}
function paint(){const a=document.getElementById('room-actor');if(!a)return;a.style.left=actorX+'px';a.style.top=actorY+'px';a.style.zIndex=String(Math.round(actorY)+1);
 const moving=held.size||target;const col=moving&&!state.settings.reduce?[0,1,0,2][Math.floor(walkT/.13)%4]:0;
 a.querySelector('.room-sprite').style.backgroundPosition=(col*50)+'% '+(rows[facing]*100/3)+'%'}
function near(){
 const list=[];const d=(p)=>Math.hypot(actorX-p[0],actorY-p[1]);
 items().forEach((it,i)=>{if(!state.items[it.name])list.push({type:'item',i,dist:d(reachOf(it.pos))})});
 const sc=SCENES[id];if(quest())list.push({type:'quest',dist:d(reachOf(sc.quest))});
 list.push({type:'npc',dist:d([sc.npc[1],clampY(sc.npc[2]+20)])});
 if(sc.special&&specialState())list.push({type:'special',dist:d(sc.special)});
 return list.sort((a,b)=>a.dist-b.dist);
}
function goTo(type,i){const sc=SCENES[id];let p;
 if(type==='item')p=reachOf(items()[i].pos);else if(type==='quest')p=reachOf(sc.quest);else if(type==='npc')p=[clampX(sc.npc[1]-80),clampY(sc.npc[2]+10)];else if(type==='special')p=[sc.special[0],clampY(sc.special[1])];else p=[EXIT[0],FLOOR.y1];
 target={x:p[0],y:p[1]};pending={type,i};}
window.roomTap=function(type,i){if(performance.now()<lock||KD.sheetOpen())return;
 const n=near().find(x=>x.type===type&&(type!=='item'||x.i===i));
 const reach=type==='exit'?60:type==='npc'?150:140;
 if(n&&n.dist<reach){act(type,i);return}
 window.playGameSound?.('move');goTo(type,i);
};
function act(type,i){
 target=null;pending=null;held.clear();
 if(type==='item')return take(i);
 if(type==='quest')return solve();
 if(type==='npc'){window.playGameSound?.('tap');npcSay(KD.npcLine(id));return}
 if(type==='special'){const s=specialState();if(!s)return;window.playGameSound?.('door');lock=performance.now()+800;show(s);return}
 if(type==='exit')return roomLeave();
}
function take(i){const it=items()[i];if(!it||state.items[it.name])return;
 const node=document.querySelector('.room-pickup[data-i="'+i+'"]');
 if(id==='shop'&&it.name==='たまねぎ'){state.shortage=true;save();window.playGameSound?.('nope');node?.classList.add('sold-out');lock=performance.now()+600;
   npcSay(KD.LINES.shop[1],4200);KD.toast(KD.item('たまねぎ')+'うりきれ… ひろばで きいてみよう');setTimeout(()=>{if(screen==='place'&&id==='shop')rebuild()},1400);return}
 if(it.name==='まき'){window.playGameSound?.('door');lock=performance.now()+800;show('forest');return}
 state.items[it.name]=true;state.stars=(state.stars||0)+1;save();
 node?.classList.add('taken');lock=performance.now()+700;held.clear();target=null;
 KD.gotItem(it.name,()=>{if(screen!=='place')return;rebuild();afterTake()});
}
function afterTake(){
 const left=items().filter(it=>!state.items[it.name]).length;const g=KD.goal();
 if(!left){window.playGameSound?.('success');
  if(specialState()){msg(id==='theater'?'ぶたいの まんなかへ いこう！':'おなべの ところへ いこう！');return}
  document.querySelector('.room-back')?.classList.add('glow');
  KD.toast(KD.icon('check')+'ここは おわり！ '+(g&&g!==id?'つぎは '+KD.ZONES[g].kana:''),2400);}
}
function solve(){const q=quest();if(!q)return;state.side[q.id]=true;save();window.playGameSound?.('success');
 const n=document.querySelector('.room-quest');n?.classList.add('taken');
 KD.toast(KD.quest(q.id)+q.title+' … できた！',2600);npcSay('ありがとう！ まちに おはなが さいたよ！');setTimeout(()=>{if(screen==='place')n?.remove()},700)}
window.roomA=function(){if(KD.sheetOpen()){KD.closeSheet();return}if(performance.now()<lock)return;const n=near()[0];
 const reach=n&&{item:140,quest:140,npc:150,special:90}[n.type];
 if(n&&n.dist<reach){act(n.type,n.i);return}
 window.playGameSound?.('tap');msg('キラキラに ちかづいて A！');
 const a=document.getElementById('room-actor');a?.classList.remove('waving');void a?.offsetWidth;a?.classList.add('waving');};
window.roomB=function(){if(KD.closeSheet())return;roomLeave()};
window.roomLeave=function(){if(screen!=='place')return;window.playGameSound?.('door');active=false;document.querySelector('.room-game')?.classList.add('leaving');setTimeout(()=>show('map'),state.settings.reduce?0:200)};
function tick(t){if(!active||screen!=='place')return;const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(KD.sheetOpen()){raf=requestAnimationFrame(tick);return}
 let dx=Number(held.has('right'))-Number(held.has('left')),dy=Number(held.has('down'))-Number(held.has('up'));
 if(dx||dy){target=null;pending=null}else if(target){dx=target.x-actorX;dy=target.y-actorY;if(Math.hypot(dx,dy)<6){const p=pending;target=null;pending=null;dx=dy=0;if(p){act(p.type,p.i);raf=requestAnimationFrame(tick);return}}}
 if(dx||dy){const len=Math.hypot(dx,dy),step=Math.min(280*dt,target?len:1e9);actorX=clampX(actorX+dx/len*step);actorY=clampY(actorY+dy/len*step);walkT+=dt;
  facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
  if(Math.hypot(actorX-EXIT[0],actorY-FLOOR.y1)>90)armed=true;
  if(armed&&actorY>=FLOOR.y1-1&&Math.abs(actorX-EXIT[0])<70&&dy>0&&!target){roomLeave();return}
  // touching = picking up
  if(performance.now()>lock){const n=near();for(const x of n){if(x.type==='item'&&x.dist<55){act('item',x.i);break}if(x.type==='quest'&&x.dist<50){act('quest');break}if(x.type==='special'&&x.dist<50){act('special');break}}}
 }else walkT=0;
 const n=near()[0],ready=n&&n.dist<({item:140,quest:140,npc:150,special:90,exit:70}[n.type]);
 const a=document.getElementById('room-a');if(a){a.classList.toggle('ready',Boolean(ready&&n.type!=='exit'));a.querySelector('small').textContent=ready?{item:'とる',quest:'たすける',npc:'はなす',special:'はじめる',exit:'でる'}[n.type]:'しらべる'}
 paint();raf=requestAnimationFrame(tick)}
function mount(fresh){
 fit();active=true;last=performance.now();held.clear();target=null;pending=null;
 if(fresh){actorX=EXIT[0];actorY=FLOOR.y1-30;facing='up';armed=false;lock=performance.now()+500;}
 const st=document.getElementById('room-stage');
 st.addEventListener('pointerdown',e=>{if(e.target.closest('button')||KD.sheetOpen())return;const r=st.getBoundingClientRect();const x=(e.clientX-r.left-offX)/scale,y=(e.clientY-r.top-offY)/scale;target={x:clampX(x),y:clampY(y)};pending=null;window.playGameSound?.('move')});
 document.querySelectorAll('.room-direction').forEach(b=>{const on=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.add(b.dataset.dir);b.classList.add('pressed');window.playGameSound?.('move')};const off=()=>{held.delete(b.dataset.dir);b.classList.remove('pressed')};b.onpointerdown=on;b.onpointerup=off;b.onpointercancel=off;b.onlostpointercapture=off;b.oncontextmenu=e=>e.preventDefault()});
 paint();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
 if(fresh){const first=KD.npcLine(id);setTimeout(()=>{if(screen==='place')npcSay(first,3600)},450);
  const s=specialState();if(s)setTimeout(()=>msg(s==='stage'?'ぶたいの まんなかへ いこう！':s==='mix'?'おなべの ところへ いこう！':'ランタンの ところへ いこう！'),500);
  else if(items().some(it=>!state.items[it.name]))setTimeout(()=>msg('キラキラを さがそう！'),500);}
}
function rebuild(){const fresh=false;build();mount(fresh)}
function exit(){active=false;held.clear();target=null;cancelAnimationFrame(raf)}
const keyDir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
window.addEventListener('keydown',e=>{if(screen!=='place'||e.target.closest('input'))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyDir[k]){e.preventDefault();held.add(keyDir[k])}else if(!e.repeat&&(k==='z'||k==='Enter')&&!e.target.closest('button')){e.preventDefault();roomA()}else if(!e.repeat&&(k==='x'||k===' ')&&!e.target.closest('button')){e.preventDefault();roomB()}});
window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyDir[k])held.delete(keyDir[k])});
window.addEventListener('resize',()=>{if(screen==='place')fit()});
let lastZone=null;
render=function(){if(screen!=='place'){exit();lastZone=null;previous();return}exit();if(!SCENES[hint]){show('map');return}const fresh=lastZone!==hint;id=hint;lastZone=hint;build();mount(fresh)};
// a re-render while inside (e.g. after closing the bag) must keep the dragon where it stands
window.KD.roomSnapshot=()=>({id,x:actorX,y:actorY});
})();
