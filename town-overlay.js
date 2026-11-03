/* Town HUD (picture mission strip, menu sheet, guide arrow, signs) and the sound engine. */
(() => {
 const previousRender=render;
 let audioContext=null;const lastPlayed={};
 const cues={
  tap:[[660,.05],[990,.07]],menu:[[440,.06],[660,.07],[880,.09]],move:[[330,.03]],door:[[520,.07],[780,.08],[1040,.12],[1560,.14]],
  pickup:[[660,.07],[880,.07],[1320,.14]],cancel:[[520,.06],[330,.1]],jump:[[392,.07],[784,.11]],
  success:[[523,.1],[659,.1],[784,.12],[1047,.28]],place:[[294,.06],[440,.1]],stir:[[240,.05],[300,.06]],
  sparkle:[[1320,.05],[1760,.06],[2093,.1]],star:[[1175,.08],[1568,.14]],firework:[[160,.14],[1100,.05],[1400,.06],[1700,.08]],nope:[[300,.08],[260,.1]]
 };
 window.playGameSound=function(type='tap'){
   if(!state.settings?.sound)return;
   const now=performance.now();if(now-(lastPlayed[type]||0)<(type==='move'?220:80))return;lastPlayed[type]=now;
   try{
     audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
     if(audioContext.state==='suspended')audioContext.resume();
     let offset=0;
     for(const [frequency,duration] of (cues[type]||cues.tap)){
       const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+offset;
       osc.type=type==='move'||type==='stir'?'triangle':'sine';osc.frequency.setValueAtTime(frequency,t);
       if(type==='firework'&&offset===0)osc.frequency.exponentialRampToValueAtTime(900,t+duration);
       gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.002,state.settings.volume*(type==='move'?.07:.13)),t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
       osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+duration+.02);offset+=duration*.78;
     }
   }catch{}
 };
 tone=function(){playGameSound('pickup')};
 // Every button press gives a soft cue unless it plays its own sound.
 document.addEventListener('pointerdown',e=>{
   const b=e.target.closest('button');if(!b||b.dataset.sfx==='none')return;
   if(b.matches('[data-dir],[data-forest-dir],.room-direction'))playGameSound('move');
   else if(b.matches('[data-close],.kd-x')||/もどる|まちへ|とじる/.test(b.textContent))playGameSound('cancel');
   else playGameSound('tap');
 },true);

 const Z=()=>KD.ZONES;
 function menu(){
   if(KD.closeSheet())return;
   const tile=(icon,label,act,cls='')=>'<button class="kd-tile '+cls+'" onclick="'+act+'">'+KD.icon(icon)+'<span>'+label+'</span></button>';
   KD.sheet('<header class="kd-sheet-head">'+KD.icon('star')+'<h2>メニュー</h2><button class="kd-x" data-close aria-label="とじる">'+KD.icon('close')+'</button></header><div class="kd-tiles">'+
     tile('bag','もちもの','KD.bag()')+tile('guide','あんない','KD.closeSheet(true);KD.guideTo()')+tile('book','ずかん',"KD.closeSheet(true);show('book')")+
     (state.done[1]?tile('moon','ほしぞら',"KD.closeSheet(true);show('stars')")+tile('fire','はなび',"KD.closeSheet(true);show('fireworks')"):'')+
     tile('hand','あそびかた',"KD.closeSheet(true);show('help')")+tile('gear','せってい',"KD.closeSheet(true);show('settings')")+tile('home','ひょうし',"KD.closeSheet(true);show('home')")+
   '</div>',{cls:'menu',label:'メニュー'});
 }
 window.toggleTownMenu=menu;
 function missionStrip(){
   const m=current(),n=collected(),t=total();
   return '<button class="hud-mission" onclick="KD.bag()" aria-label="もちもの '+n+' / '+t+'"><span class="hud-title">'+(state.done[1]?'ワクワクタウン':m.name)+'</span><span class="hud-items">'+
     (state.done[1]?KD.icon('star')+KD.icon('star')+KD.icon('star'):m.needs.map(i=>'<span class="hud-slot '+(state.items[i[1]]?'got':'')+'">'+KD.item(i[1])+(state.items[i[1]]?KD.icon('check','kd-check'):'')+'</span>').join(''))+'</span></button>';
 }
 function intro(){
   if(KD.sheetOpen())return;
   if(state.chapter===0&&!state.intro[0]){
     KD.sheet('<div class="kd-story">'+KD.npc('uncle','kd-story-npc')+'<p class="kd-bubble">たいへん！<br>にんぎょうげきが<br>はじまらない！？<br><small>どうぐを あつめてきて！</small></p></div><h3 class="kd-sub">あつめるもの</h3>'+KD.needsGrid(false)+'<button class="kd-btn go big" data-close>'+KD.icon('hand')+'まかせて！</button>',{cls:'story',label:'ミッション',dismiss:false,onClose:()=>{state.intro[0]=true;save()}});
   }else if(state.chapter===1&&!state.done[1]&&!state.intro[1]){
     KD.sheet('<div class="kd-story">'+KD.npc('girl','kd-story-npc')+'<p class="kd-bubble">キャンプの<br>ばんごはんを つくろう！<br><small>'+state.meal+'の ざいりょう</small></p></div>'+KD.needsGrid(false)+'<div class="kd-row"><button class="kd-btn" onclick="KD.closeSheet(true);show(\'cook\')">'+KD.icon('camp')+'りょうりを えらぶ</button><button class="kd-btn go" data-close>'+KD.icon('hand')+'いってきます！</button></div>',{cls:'story',label:'ミッション',dismiss:false,onClose:()=>{state.intro[1]=true;save()}});
   }else if(state.done[1]&&!state.intro[2]){
     state.intro[2]=true;save();
     KD.sheet('<div class="kd-ribbon">ぜんぶ クリア！</div><div class="kd-story">'+KD.icon('fire','kd-story-icon')+'<p class="kd-bubble">まちの みんなが<br>ありがとう って！<br><small>こよいは はなびたいかい！</small></p></div><button class="kd-btn go big" onclick="KD.closeSheet(true);show(\'fireworks\')">'+KD.icon('fire')+'はなびを みる</button>',{cls:'story',label:'クリア'});
   }
 }
 function decorateWorld(world){
   const g=KD.goal();
   const parts=[];
   for(const p of places){const z=Z()[p.id];const [x,y]=z.door;
     parts.push('<span class="town-sign'+(g===p.id?' goal':'')+'" data-zone="'+p.id+'" style="left:'+x+'px;top:'+(y-44)+'px">'+z.kana+'</span>');
     parts.push('<span class="town-door" style="left:'+x+'px;top:'+y+'px" aria-hidden="true"></span>');
     const q=sideQuests.find(q=>q.place===p.id);
     if(q&&state.side[q.id])for(const [ox,oy,c] of [[-46,18,'#f47ca0'],[44,10,'#ffd45a'],[-30,40,'#9fd2f2'],[30,38,'#f59bb5']])parts.push('<span class="town-flower" style="left:'+(x+ox)+'px;top:'+(y+oy)+'px;--c:'+c+'" aria-hidden="true"></span>');
   }
   if(g){const z=Z()[g],[x,y]=z.door,need=KD.itemsIn(g).find(i=>!state.items[i[1]]);
     parts.push('<div class="guide-marker" style="left:'+x+'px;top:'+y+'px" aria-hidden="true"><span class="guide-ring"></span><span class="guide-bubble">'+(need?KD.item(need[1]):KD.icon(z.icon))+'</span><svg class="guide-arrow" viewBox="0 0 40 40"><path d="M20 36L6 18h9V4h10v14h9Z"/></svg></div>');}
   if(state.done[0])parts.push('<span class="town-bunting" style="left:52px;top:52px" aria-hidden="true"></span>');
   world.insertAdjacentHTML('beforeend',parts.join(''));
 }
 // Edge arrow pointing at an off-screen goal, so the next place is never a mystery.
 window.townFrame=function(){
   const edge=document.querySelector('.guide-edge');if(!edge)return;
   const g=KD.goal();if(!g){edge.hidden=true;return;}
   const v=townView(),[x,y]=Z()[g].door,sx=v.x+x*v.s,sy=v.y+y*v.s;
   const top=110,bottom=v.h-190,inside=sx>30&&sx<v.w-30&&sy>top&&sy<bottom;
   edge.hidden=inside;if(inside)return;
   const cx=v.w/2,cy=(top+bottom)/2,dx=sx-cx,dy=sy-cy,k=Math.min((v.w/2-44)/Math.abs(dx||1),((bottom-top)/2-10)/Math.abs(dy||1));
   edge.style.left=(cx+dx*k)+'px';edge.style.top=(cy+dy*k)+'px';
   edge.querySelector('svg').style.transform='rotate('+(Math.atan2(dy,dx)*180/Math.PI-90)+'deg)';
 };
 render=function(){
   previousRender();
   if(screen!=='map')return;
   const app=document.getElementById('app'),map=app.querySelector('#map'),controls=app.querySelector('.game-controls');
   if(!map||!controls)return;
   const stage=document.createElement('main');stage.className='town-play';stage.setAttribute('aria-label','ワクワクタウンのまち');
   app.querySelector('.top')?.remove();app.querySelector('.bottom')?.remove();app.querySelector('.map-tip')?.remove();
   stage.append(map);
   stage.insertAdjacentHTML('beforeend','<header class="town-hud">'+missionStrip()+'<button class="town-menu-toggle" data-sfx="none" onclick="toggleTownMenu()" aria-label="メニュー">'+KD.icon('star')+'<span>メニュー</span></button></header><div class="guide-edge" hidden aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 36L6 18h9V4h10v14h9Z"/></svg></div>');
   stage.append(controls);
   app.append(stage);
   decorateWorld(map.querySelector('#world'));
   window.recenterTown?.();
   setTimeout(intro,state.settings.reduce?0:350);
 };
 render();
})();
