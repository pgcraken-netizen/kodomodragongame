/* Overlay town HUD and sound design. Keeps existing map/game logic intact. */
(() => {
 const previousRender=render;
 let menuOpen=false, audioContext=null, lastStep=0;
 const cues={tap:[[650,.06],[900,.08]],menu:[[420,.06],[620,.09]],move:[[320,.035]],arrive:[[620,.09],[850,.1],[1120,.13]],pickup:[[550,.08],[800,.1],[1050,.13]],cancel:[[480,.07],[290,.12]],jump:[[380,.08],[680,.12]],success:[[523,.1],[659,.1],[784,.12],[1047,.2]]};
 window.playGameSound=function(type='tap'){
   if(!state.settings?.sound)return;
   try{
     audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
     if(audioContext.state==='suspended')audioContext.resume();
     let offset=0;
     for(const [frequency,duration] of (cues[type]||cues.tap)){
       const osc=audioContext.createOscillator(),gain=audioContext.createGain(),t=audioContext.currentTime+offset;
       osc.type=type==='move'?'triangle':'sine';osc.frequency.setValueAtTime(frequency,t);
       gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.002,state.settings.volume*.12),t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
       osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+duration+.02);offset+=duration*.76;
     }
   }catch{}
 };
 const originalTone=tone;
 tone=function(){playGameSound('pickup')};
 function closeMenu(){menuOpen=false;const p=document.querySelector('.town-menu-panel'),b=document.querySelector('.town-menu-toggle');if(p)p.hidden=true;if(b)b.setAttribute('aria-expanded','false')}
 window.toggleTownMenu=function(){menuOpen=!menuOpen;const p=document.querySelector('.town-menu-panel'),b=document.querySelector('.town-menu-toggle');if(p)p.hidden=!menuOpen;if(b)b.setAttribute('aria-expanded',String(menuOpen));playGameSound(menuOpen?'menu':'cancel')};
 render=function(){
   previousRender();
   if(screen!=='map'){menuOpen=false;return}
   const app=document.getElementById('app'),map=app.querySelector('#map'),top=app.querySelector('.top'),bottom=app.querySelector('.bottom'),controls=app.querySelector('.game-controls');
   if(!map||!controls)return;
   const stage=document.createElement('main');stage.className='town-play';stage.setAttribute('aria-label','ワクワクタウンのまち');
   app.append(stage);
   stage.append(map,top);
   const panel=document.createElement('aside');panel.className='town-menu-panel';panel.id='town-menu-panel';panel.hidden=true;
   panel.setAttribute('aria-label','ゲームメニュー');panel.append(...bottom.children);bottom.remove();
   stage.append(panel);
   const toggle=document.createElement('button');toggle.className='town-menu-toggle';toggle.type='button';toggle.textContent='☰';toggle.setAttribute('aria-label','メニューを開く');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','town-menu-panel');toggle.onclick=toggleTownMenu;stage.append(toggle);
   stage.append(controls);
   const tip=app.querySelector('.map-tip');if(tip)tip.remove();
   stage.addEventListener('pointerdown',e=>{if(menuOpen&&!e.target.closest('.town-menu-panel,.town-menu-toggle'))closeMenu()});
 };
 // Sound starts only after an actual gesture; no autoplay. Every UI action has a soft feedback cue.
 document.addEventListener('pointerdown',e=>{
   const b=e.target.closest('button');
   if(!b)return;
   if(b.classList.contains('town-menu-toggle'))return;
   if(b.matches('[data-dir], [data-forest-dir]')){
     if(performance.now()-lastStep>115){playGameSound('move');lastStep=performance.now();}
   }else if(b.matches('[data-action="b"],[data-forest-action="b"]'))playGameSound('jump');
   else if(b.matches('[data-action="a"],[data-forest-action="a"]'))playGameSound('tap');
   else if(b.textContent.includes('もどる')||b.textContent.includes('キャンセル'))playGameSound('cancel');
   else playGameSound('tap');
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&screen==='map'){closeMenu();playGameSound('cancel')}});
 // New players hear sound, but a previously saved off preference is never overridden.
 try{const prior=JSON.parse(localStorage.getItem(KEY)||'null');if(!prior||!prior.settings||!Object.hasOwn(prior.settings,'sound')){state.settings.sound=true;save()}}catch{}
 render();
})();
