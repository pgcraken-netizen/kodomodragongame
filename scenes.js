/* Story scenes drawn as pictures: theater set-up, cooking, starry sky, fireworks, picture book and help. */
(()=>{
const previous=render;
const O='stroke="#5a3a26" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
const svg=(vb,body,cls='',par='')=>'<svg viewBox="'+vb+'" class="'+cls+'"'+(par?' preserveAspectRatio="'+par+'"':'')+' aria-hidden="true"><g filter="url(#crayon)" '+O+'>'+body+'</g></svg>';
function page(cls,title,body,back="show('map')"){
 el('<main class="kd-scene '+cls+'"><header class="kd-scene-head"><button class="kd-round" data-sfx="none" onclick="playGameSound(\'cancel\');'+back+'" aria-label="もどる">'+KD.icon('back')+'</button><h1 class="kd-title">'+title+'</h1><span class="kd-round-spacer"></span></header>'+body+'</main>');
}
const DISH={
 'カレー':'<ellipse cx="50" cy="62" rx="44" ry="22" fill="#fff"/><path d="M14 60q36-26 72 0-36 22-72 0Z" fill="#d98b2b"/><path d="M50 44q30 4 34 16-20 10-34 2Z" fill="#fff8e6" stroke-width="3"/><circle cx="34" cy="58" r="5" fill="#f28d35" stroke-width="2"/><circle cx="46" cy="64" r="5" fill="#ecc68e" stroke-width="2"/>',
 'やさいスープ':'<path d="M10 46h80q-4 40-40 40T10 46Z" fill="#fff"/><ellipse cx="50" cy="46" rx="40" ry="10" fill="#f6c26a"/><circle cx="38" cy="46" r="5" fill="#f28d35" stroke-width="2"/><circle cx="58" cy="44" r="5" fill="#7cc06a" stroke-width="2"/><path d="M40 26q-6-8 0-16M56 28q-6-8 0-16" fill="none" stroke-width="3"/>',
 'やきいも':'<path d="M12 64Q26 30 64 34q34 10 14 36Q48 86 12 64Z" fill="#a35c92"/><path d="M40 46q18-6 34 6l-6 18q-18 4-30-6Z" fill="#ffd45a" stroke-width="3"/><path d="M30 30q-4-8 2-14M46 28q-4-8 2-14" fill="none" stroke-width="3"/>'
};
const dish=(m,cls='kd-dish')=>svg('0 0 100 100',DISH[m]||DISH['カレー'],cls);
/* ---------------- theater: place props ---------------- */
const SLOTS=[['ぶたいの ぬの',50,30,46],['しょうめい',14,16,22],['たいこ',18,66,24],['にんぎょう',58,62,26]];
function stageScene(){
 const placed=new Set(state.stagePlaced||[]);
 page('stage-set','ぶたいを つくろう',
  '<div class="theater-box">'+svg('0 0 100 80','<rect x="0" y="0" width="100" height="80" fill="#3a2a4a"/><path d="M6 64H94L100 80H0Z" fill="#d9a466"/><path d="M0 0q14 20 8 64L0 66Z" fill="#d94b5c"/><path d="M100 0q-14 20-8 64l8 2Z" fill="#d94b5c"/><path d="M0 0H100V10Q50 18 0 10Z" fill="#e85e6e"/>','theater-bg')+
  SLOTS.map(([n,x,y,w])=>'<span class="prop-slot'+(placed.has(n)?' filled':'')+'" style="left:'+x+'%;top:'+y+'%;width:'+w+'%" data-slot="'+n+'">'+KD.item(n)+'</span>').join('')+'</div>'+
  '<p class="kd-say">'+KD.icon('hand')+'どうぐを タップして ぶたいに おこう！</p>'+
  '<div class="prop-tray">'+SLOTS.map(([n])=>'<button class="prop-btn'+(placed.has(n)?' used':'')+'" data-sfx="none" onclick="placeProp2(\''+n+'\',this)" aria-label="'+n+'を おく"'+(placed.has(n)?' disabled':'')+'>'+KD.item(n)+'<b>'+n+'</b></button>').join('')+'</div>');
}
window.placeProp2=function(n,b){
 const list=new Set(state.stagePlaced||[]);if(list.has(n))return;list.add(n);state.stagePlaced=[...list];save();
 playGameSound('place');b.classList.add('used');b.disabled=true;
 const slot=document.querySelector('[data-slot="'+n+'"]');slot?.classList.add('filled','pop');
 if(list.size>=4){playGameSound('success');setTimeout(()=>{if(screen==='stage')show('untangle')},900)}
};
/* ---------------- theater: untangle the strings ---------------- */
const KNOTS=[[18,55],[40,28],[62,70],[84,40]];
function untangleScene(){
 page('untangle','いとが からまった！',
  '<div class="thread-box">'+svg('0 0 100 100','<path id="tangle" d="M5 50C20 10 30 90 40 30S60 10 62 70 80 90 84 40 95 20 98 50" fill="none" stroke="#f47ca0" stroke-width="3"/><path d="M5 50C25 70 30 20 18 55S45 60 40 28 70 40 62 70 90 60 84 40" fill="none" stroke="#e9675e" stroke-width="2.4" opacity=".8"/>','thread-svg')+
  KNOTS.map(([x,y],i)=>'<button class="knot2'+(i===0?' next':'')+'" data-k="'+(i+1)+'" data-sfx="none" style="left:'+x+'%;top:'+y+'%" onclick="untie2('+(i+1)+')" aria-label="むすびめ '+(i+1)+'"><span>'+(i+1)+'</span></button>').join('')+'</div>'+
  '<p class="kd-say" id="threadStatus">'+KD.icon('hand')+'ひかってる むすびめを じゅんばんに タップ！</p>');
 progress=0;
}
window.untie2=function(n){
 if(n!==progress+1){playGameSound('nope');const b=document.querySelector('.knot2.next');b?.classList.remove('wiggle');void b?.offsetWidth;b?.classList.add('wiggle');return}
 progress=n;const b=document.querySelector('[data-k="'+n+'"]');b.classList.remove('next');b.classList.add('done');
 document.querySelector('[data-k="'+(n+1)+'"]')?.classList.add('next');playGameSound('sparkle');
 document.querySelector('.thread-svg').style.setProperty('--calm',String(n/4));document.querySelector('.thread-box').dataset.step=String(n);
 document.getElementById('threadStatus').innerHTML=KD.icon('star')+n+' / 4 ほどけた！';
 if(n===4){playGameSound('success');visitTimer=setTimeout(()=>show('curtain'),800)}
};
/* ---------------- theater: curtain up! ---------------- */
function puppet(c,face='#f8c999'){return svg('0 0 60 120','<path d="M30 70v50" stroke-width="5"/><path d="M12 72q0-30 18-30t18 30Z" fill="'+c+'"/><circle cx="30" cy="30" r="17" fill="'+face+'"/><path d="M22 28q3-4 6 0M33 28q3-4 6 0" fill="none" stroke-width="3"/><path d="M24 36q6 6 12 0" fill="#d9555f" stroke-width="3"/><path d="M13 22q4-14 17-14t17 14q-17-6-34 0Z" fill="#8b5a2b"/>','puppet')}
function curtainScene(){
 const replay=state.done[0];
 page('curtain-up',replay?'にんぎょうげき':'いよいよ かいえん！',
  '<div class="show-box" id="showBox">'+svg('0 0 100 70','<rect width="100" height="70" fill="#7cbfd8" stroke="none"/><path d="M0 50Q30 34 60 46T100 40V70H0Z" fill="#9fd38a"/><path d="M60 46v-24l10-8 10 8v24" fill="#f2e6c8"/><circle cx="16" cy="14" r="8" fill="#ffd45a"/><path d="M0 58H100V70H0Z" fill="#d9a466"/>','show-bg')+
  '<div class="puppets"><span class="p1">'+puppet('#e96c79')+'</span><span class="p2">'+puppet('#7cc06a','#f3d2a8')+'</span></div>'+
  '<div class="curtain-l"></div><div class="curtain-r"></div><div class="valance"></div></div>'+
  '<div class="audience" aria-hidden="true">'+Array.from({length:7},(_,i)=>'<span style="--d:'+(i*.13)+'s"></span>').join('')+'</div>'+
  '<p class="kd-say" id="showSay">'+KD.icon('hand')+'まくを タップして あけよう！</p>'+
  '<button class="kd-btn go big" id="openBtn" onclick="openCurtain()">'+KD.icon('mask')+'まくを あける！</button>',replay?"show('book')":"show('map')");
 document.getElementById('showBox').onclick=openCurtain;
}
window.openCurtain=function(){
 const box=document.getElementById('showBox');if(!box||box.classList.contains('open'))return;
 box.classList.add('open');document.getElementById('openBtn')?.remove();playGameSound('success');
 document.querySelector('.audience')?.classList.add('clap');
 const lines=['むかしむかし、あるところに…','「いっしょに あそぼう！」','ぱち ぱち ぱち！ だいせいこう！'];let i=0;
 const say=document.getElementById('showSay');const next=()=>{if(screen!=='curtain')return;say.textContent=lines[i];window.say?.(lines[i]);i++;if(i<lines.length)visitTimer=setTimeout(next,1700);else visitTimer=setTimeout(finishShow,1500)};next();
};
function finishShow(){
 if(screen!=='curtain')return;
 if(state.done[0]){KD.sheet('<div class="kd-ribbon">また みてね！</div>'+stamp('mask','にんぎょうげき')+'<button class="kd-btn go big" data-close>'+KD.icon('book')+'ずかんへ</button>',{onClose:()=>show('book')});return}
 state.done[0]=true;state.chapter=1;state.stars=(state.stars||0)+5;delete state.stagePlaced;state.intro[1]=false;save();
 KD.sheet('<div class="kd-ribbon">だいせいこう！</div>'+stamp('mask','にんぎょうげき スタンプ')+'<p class="kd-big">みんなで つくった<br>ぶたいだね！</p><button class="kd-btn go big" data-close>'+KD.icon('camp')+'つぎは キャンプ！</button>',{dismiss:false,onClose:()=>show('cook')});
}
const stamp=(icon,label)=>'<div class="kd-stamp">'+KD.icon(icon)+'<b>'+label+'</b></div>';
/* ---------------- camp: choose a meal ---------------- */
function cookScene(){
 if(state.chapter<1){show('map');return}
 page('cook','なにを つくる？',
  '<div class="kd-story small">'+KD.npc('girl','kd-story-npc')+'<p class="kd-bubble">キャンプの ばんごはん、<br>なにに しよう？</p></div>'+
  '<div class="recipes">'+Object.keys(recipes).map((m,i)=>'<button class="recipe'+(state.meal===m?' on':'')+'" data-sfx="none" onclick="pickMeal('+i+')" aria-pressed="'+(state.meal===m)+'">'+dish(m)+'<b>'+m+'</b><span class="r-items">'+[...recipes[m],...extras].map(it=>KD.item(it[1])).join('')+'</span></button>').join('')+'</div>'+
  '<button class="kd-btn go big" onclick="mealDecided()">'+KD.icon('hand')+state.meal+'に きめた！</button>');
}
window.pickMeal=function(i){state.meal=Object.keys(recipes)[i];save();playGameSound('tap');render()};
window.mealDecided=function(){state.intro[1]=false;save();playGameSound('success');show('map')};
/* ---------------- camp: cook with grown-ups ---------------- */
let stirs=0,lastAng=null,turn=0;
function mixScene(){
 if(collected()!==total()){show('map');return}
 stirs=0;turn=0;lastAng=null;const imo=state.meal==='やきいも';
 page('mix',state.meal+'を つくろう',
  '<div class="cook-box" id="cookBox">'+svg('0 0 100 100','<rect width="100" height="100" fill="#ffe7b0" stroke="none"/><path d="M0 70Q50 60 100 70V100H0Z" fill="#9fcf80"/><path d="M28 92l44-10M28 82l44 10" stroke-width="5"/><path d="M28 92l44-10M28 82l44 10" stroke="#a7703f" stroke-width="2.5"/><path d="M50 84q-8-10 0-20 2 8 7 10 3 8-7 10Z" fill="#ef9c4b" class="flame"/><path d="M30 80L50 40 70 80" fill="none" stroke-width="3"/>','cook-bg')+
  '<div class="pot-wrap" id="pot"><div class="pot-body">'+(imo?KD.item('さつまいも','pot-imo'):'<span class="soup" style="--soup:'+({'カレー':'#d98b2b','やさいスープ':'#f6c26a'}[state.meal])+'"></span>')+'</div><span class="spoon" id="spoon"></span><span class="steam s1"></span><span class="steam s2"></span></div>'+
  '<div class="cook-adult">'+KD.npc('uncle')+'<p>ひは おとなが みてるよ</p></div></div>'+
  '<div class="stir-dots">'+Array.from({length:5},(_,i)=>'<span data-dot="'+i+'"></span>').join('')+'</div>'+
  '<p class="kd-say">'+KD.icon('hand')+(imo?'おいもを タップして ころころ かえそう':'おなべの なかを ぐるぐる なぞろう（タップでも OK）')+'</p>');
 const pot=document.getElementById('pot');
 pot.onpointerdown=e=>{pot.setPointerCapture(e.pointerId);lastAng=null;turn=0;stirOnce(.5)};
 pot.onpointermove=e=>{if(!e.buttons&&e.pointerType!=='touch')return;const r=pot.getBoundingClientRect(),a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2);
  const sp=document.getElementById('spoon');if(sp)sp.style.transform='rotate('+(a*180/Math.PI+90)+'deg)';
  if(lastAng!==null){let d=a-lastAng;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;turn+=Math.abs(d);if(turn>Math.PI*1.6){turn=0;stirOnce(1)}}lastAng=a};
 pot.onpointerup=()=>{lastAng=null};
}
let lastStir=0;
function stirOnce(w){const now=performance.now();if(now-lastStir<(w<1?450:250))return;lastStir=now;stirs++;playGameSound('stir');
 const pot=document.getElementById('pot');pot?.classList.remove('bump');void pot?.offsetWidth;pot?.classList.add('bump');
 document.querySelector('[data-dot="'+(stirs-1)+'"]')?.classList.add('on');
 if(stirs>=5){playGameSound('success');setTimeout(()=>{if(screen==='mix')show('feast')},600)}}
function feastScene(){
 const first=!state.done[1];
 if(first){state.done[1]=true;state.stars=(state.stars||0)+5;save();}
 page('feast','いただきます！',
  '<div class="feast-box">'+svg('0 0 100 70','<rect width="100" height="70" fill="#f7b98f" stroke="none"/><circle cx="50" cy="40" r="16" fill="#ffd27a" stroke="none"/><path d="M0 46Q50 34 100 46V70H0Z" fill="#8fc07a"/>','feast-bg')+
  '<div class="feast-row">'+KD.npc('boy')+'<span class="kd-dragon-cheer big"></span>'+KD.npc('girl')+'</div><div class="feast-dish">'+dish(state.meal)+'</div></div>'+
  '<p class="kd-say">'+KD.icon('star')+state.meal+'が できた！ みんなで つくると おいしいね</p>'+
  (first?stamp('camp','キャンプ スタンプ'):'')+
  '<button class="kd-btn go big" onclick="show(\'stars\')">'+KD.icon('moon')+'よるに なったよ</button>');
 playGameSound('success');
}
/* ---------------- night sky ---------------- */
const BEAR=[[22,40],[34,32],[48,34],[60,40],[70,52],[56,60],[40,58]];
function starsScene(){
 progress=0;
 let dots='';for(let i=0;i<60;i++){const x=(i*37.7)%100,y=(i*53.3)%62;dots+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(.25+(i%3)*.18)+'" fill="#fff8d0" stroke="none" class="tw" style="animation-delay:'+(i%7)*.4+'s"/>'}
 page('night','ほしぞら かんさつ',
  '<div class="sky-box" id="sky">'+svg('0 0 100 100','<rect width="100" height="100" fill="url(#skynight)" stroke="none"/>'+dots+'<circle cx="84" cy="14" r="6" fill="#ffe28a" stroke-width="1"/><path d="M0 84Q30 74 60 82T100 78V100H0Z" fill="#20305a" stroke-width="1"/><path d="M8 84l6-14 6 14ZM82 80l5-12 5 12Z" fill="#1a2a4a" stroke-width="1"/>','sky-bg')+
  '<svg class="bear" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path id="bearLine" d="" fill="none" stroke="#bfe3ff" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/><path class="bear-shape" d="M18 44q2-12 14-14l4-6 4 6q12-2 20 4 14 2 14 14l-2 14q-8 4-14 2l-4 6-6-6q-10 2-20 0l-4 6-4-6q-10-6-6-16Z" fill="#bfe3ff22" stroke="#bfe3ff" stroke-width="2" vector-effect="non-scaling-stroke" stroke-dasharray="6 6"/></svg>'+
  BEAR.map(([x,y],i)=>'<button class="star2'+(i===0?' next':'')+'" data-s="'+i+'" data-sfx="none" style="left:'+x+'%;top:'+y+'%" onclick="tapStar('+i+')" aria-label="ほし '+(i+1)+'">'+KD.icon('star')+'</button>').join('')+
  '<span class="shooting" aria-hidden="true"></span>'+
  '<div class="lying" aria-hidden="true"><span class="kd-dragon-cheer"></span>'+KD.npc('girl')+KD.npc('boy')+'<span class="lantern"></span></div></div>'+
  '<p class="kd-say" id="skyNote">'+KD.icon('hand')+'ひかる ほしを じゅんばんに タップ！</p><div class="kd-row night-btns" id="nightBtns" hidden><button class="kd-btn" onclick="show(\'stars\')">'+KD.icon('star')+'もういちど</button><button class="kd-btn go" onclick="show(\'fireworks\')">'+KD.icon('fire')+'はなびも みる</button></div>');
}
window.tapStar=function(i){
 const b=document.querySelector('[data-s="'+i+'"]');
 if(i!==progress){playGameSound('star');b?.classList.remove('wiggle');void b?.offsetWidth;b?.classList.add('wiggle');return}
 progress++;b.classList.remove('next');b.classList.add('lit');document.querySelector('[data-s="'+progress+'"]')?.classList.add('next');playGameSound('star');
 const pts=BEAR.slice(0,progress).map(p=>p.join(' '));document.getElementById('bearLine').setAttribute('d','M'+pts.join('L')+(progress===BEAR.length?'Z':''));
 const note=document.getElementById('skyNote');
 if(progress===BEAR.length){document.getElementById('sky').classList.add('done');playGameSound('success');note.innerHTML=KD.icon('star')+'くまの せいざが できた！ ながれぼしだ！';document.getElementById('nightBtns').hidden=false}
 else note.innerHTML=KD.icon('star')+progress+' / '+BEAR.length;
};
/* ---------------- fireworks ---------------- */
let fwCount=0;
function fireworksScene(){
 fwCount=0;
 let houses='';for(let i=0;i<9;i++){const x=i*12-2,h=10+(i*7)%12;houses+='<path d="M'+x+' 100V'+(88-h)+'h10V100Z" fill="#1d2550" stroke-width=".8"/><rect x="'+(x+3)+'" y="'+(92-h)+'" width="3" height="3" fill="#ffe28a" stroke="none"/>'}
 page('night fwscene','みんなで みる はなび',
  '<div class="sky-box" id="fwSky">'+svg('0 0 100 100','<rect width="100" height="100" fill="url(#skynight)" stroke="none"/>'+houses,'sky-bg','none')+
  '<div class="watchers" aria-hidden="true">'+KD.npc('boy')+'<span class="dragon-back"></span>'+KD.npc('girl')+'</div></div>'+
  '<p class="kd-say" id="fwNote">'+KD.icon('hand')+'そらを タップして はなびを あげよう！</p>',state.done[1]?"show('map')":"show('map')");
 const sky=document.getElementById('fwSky');
 sky.onpointerdown=e=>{if(e.target.closest('button'))return;const r=sky.getBoundingClientRect();burst(e.clientX-r.left,e.clientY-r.top)};
 setTimeout(()=>{if(screen==='fireworks'){const r=sky.getBoundingClientRect();burst(r.width*.5,r.height*.3,true)}},500);
}
function burst(x,y,auto){
 const sky=document.getElementById('fwSky');if(!sky)return;if(!auto)fwCount++;
 const heart=fwCount>0&&fwCount%5===0,star=fwCount%3===2;
 const colors=[['#ff7aa8','#ffd1e1'],['#ffd45a','#fff3b0'],['#7fd0ff','#d6f1ff'],['#9cf08a','#e2ffd8'],['#c49bff','#efe2ff']][fwCount%5];
 const n=heart?28:star?20:24,R=heart?7:Math.min(sky.clientWidth,sky.clientHeight)*.22;
 const box=document.createElement('div');box.className='fw';box.style.left=x+'px';box.style.top=y+'px';
 for(let i=0;i<n;i++){const t=i/n*Math.PI*2;let dx,dy;
  if(heart){dx=16*Math.sin(t)**3*R;dy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*R}
  else{const k=star?(i%2?.55:1):1;dx=Math.cos(t)*R*k;dy=Math.sin(t)*R*k}
  const s=document.createElement('i');s.style.setProperty('--dx',dx.toFixed(1)+'px');s.style.setProperty('--dy',dy.toFixed(1)+'px');s.style.background=i%2?colors[0]:colors[1];box.append(s)}
 sky.append(box);setTimeout(()=>box.remove(),state.settings.reduce?1200:1600);playGameSound('firework');
 const note=document.getElementById('fwNote');if(note&&!auto)note.innerHTML=heart?KD.icon('star')+'ハートの はなび！ みんな だいすき！':KD.icon('fire')+fwCount+'こ うちあげた！ '+(5-fwCount%5)+'かいめで ハート？';
}
/* ---------------- picture book ---------------- */
function bookScene(){
 const st=(on,icon,label,sub)=>'<div class="book-stamp'+(on?' on':'')+'">'+(on?KD.icon(icon):'<span class="empty">？</span>')+'<b>'+label+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>';
 page('book','ワクワク ずかん',
  '<section class="book-page"><h2>スタンプ</h2><div class="book-grid">'+st(state.done[0],'mask','にんぎょうげき')+st(state.done[1],'camp','キャンプ',state.done[1]?state.meal:'')+st(state.done[1],'star','ほしぞら')+'</div></section>'+
  '<section class="book-page"><h2>よりみち</h2><div class="book-grid small">'+sideQuests.map(q=>'<div class="book-stamp'+(state.side[q.id]?' on':'')+'">'+(state.side[q.id]?KD.quest(q.id):'<span class="empty">？</span>')+'<b>'+q.title+'</b></div>').join('')+'</div></section>'+
  '<section class="book-page"><h2>いった ばしょ '+state.seen.length+' / '+places.length+'</h2><div class="book-places">'+places.map(p=>'<span class="'+(state.seen.includes(p.id)?'on':'')+'">'+KD.ZONES[p.id].kana+'</span>').join('')+'</div></section>'+
  '<div class="kd-row">'+(state.done[0]?'<button class="kd-btn" onclick="show(\'curtain\')">'+KD.icon('mask')+'にんぎょうげき</button>':'')+(state.done[1]?'<button class="kd-btn" onclick="show(\'stars\')">'+KD.icon('moon')+'ほしぞら</button><button class="kd-btn go" onclick="show(\'fireworks\')">'+KD.icon('fire')+'はなび</button>':'')+'</div>'+
  '<button class="kd-btn wide" onclick="show(\'parents\')">'+KD.icon('home')+'おうちの人へ</button>');
}
/* ---------------- how to play (pictures first) ---------------- */
function helpScene(){
 const card=(art,txt)=>'<div class="help-card">'+art+'<p>'+txt+'</p></div>';
 page('help','あそびかた',
  '<div class="help-grid">'+
  card('<span class="help-pad">'+KD.icon('back')+'</span>','じゅうじキーで あるく<br><small>じめんを タップしても あるくよ</small>')+
  card('<span class="help-door">'+KD.icon('door')+'</span>','とびらの まえに いくと はいれる')+
  card('<span class="help-glow">'+KD.item('にんじん')+'</span>','キラキラに さわると ゲット！')+
  card('<span class="help-ab"><b class="a">A</b></span>','A … はなす・とる')+
  card('<span class="help-ab"><b class="b">B</b></span>','B … もどる・ぴょん')+
  card('<span class="help-arrow">'+KD.icon('guide')+'</span>','やじるしの ほうへ いけば だいじょうぶ')+
  '</div><p class="kd-say">'+KD.icon('star')+'じかんぎれも ゲームオーバーも ないよ</p><button class="kd-btn go big" onclick="show(\'map\')">'+KD.icon('hand')+'あそぶ！</button>',"show('home')");
}
function forestDoneScene(){
 page('feast','まき ゲット！','<div class="kd-got">'+KD.item('まき','kd-got-art')+'<span class="kd-rays"></span></div><p class="kd-big">おちえだを 3ぼん<br><b>まき</b> を てにいれた！</p><button class="kd-btn go big" onclick="hint=\'forest\';show(\'place\')">'+KD.icon('camp')+'キャンプへ もどる</button>',"hint='forest';show('place')");
 playGameSound('pickup');
}
render=function(){
 switch(screen){
  case 'mission':screen='map';previous();KD.bag();return;
  case 'hint':case 'atlas':screen='map';previous();KD.guideTo();return;
  case 'events':screen=state.done[1]?'stars':'map';return render();
  case 'stage':if(state.chapter!==0||collected()!==total()){screen='map';previous();return}return stageScene();
  case 'untangle':return untangleScene();
  case 'curtain':return curtainScene();
  case 'cook':return cookScene();
  case 'mix':return mixScene();
  case 'feast':return feastScene();
  case 'stars':return starsScene();
  case 'fireworks':return fireworksScene();
  case 'book':return bookScene();
  case 'help':return helpScene();
  case 'forestDone':return forestDoneScene();
 }
 previous();
};
render();
})();
