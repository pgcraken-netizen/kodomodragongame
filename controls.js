/* Town movement: continuous walking, camera, doors and the four-direction sprite atlas.
   Positions are stored as the sprite's top-left (compatible with old saves);
   doors are tested against the FEET point (top-left + FOOT). */
(() => {
  const SPEED = 165, LIMIT_X = 700, LIMIT_Y = 668, WORLD = 780;
  const FOOT = {x:46, y:98};
  const rows = {down:0,left:1,right:2,up:3};
  let facing = rows[state.facing] === undefined ? 'down' : state.facing;
  let frame = 0, last = 0, elapsed = 0, target = null, arrival = null;
  let jumpAt = 0, moving = false, actor = null, map = null, status = null;
  let entranceCooldown = performance.now()+1500, entranceCandidate = null, entranceAt = 0;
  let nearest = null, lastMessage = '', messageUntil = 0, pan = null, panReturn = 0;
  const pointers = new Map(), keys = new Set();
  const keyDirections = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  const oldRender = render, oldShow = show;
  window.worldScale = 1;
  if(!state.seen.length && !state.done[0] && !Object.keys(state.items).length) state.position = {x:390-FOOT.x, y:430-FOOT.y};
  const feet = () => ({x:state.position.x+FOOT.x, y:state.position.y+FOOT.y});
  const door = id => KD.ZONES[id].door;
  function stop(savePosition = true) {
    pointers.clear(); keys.clear(); target = arrival = null; pan = null;
    moving = false; jumpAt = 0; elapsed = 0;
    document.querySelectorAll('.pad-key.pressed').forEach(b => b.classList.remove('pressed'));
    if(savePosition) { state.facing = facing; save(); }
  }
  function detach() { stop(); cancelAnimationFrame(frame); frame = 0; actor = map = status = null; }
  show = function(s) { detach(); oldShow(s); };
  render = function() { detach(); oldRender(); if(screen === 'map') mount(); };
  function notify(message, hold=1800) {
    lastMessage = message; messageUntil = performance.now()+hold;
    if(status) status.textContent = message;
    say(message);
  }
  function direction(dx,dy) {
    if(Math.abs(dx)>Math.abs(dy)) facing=dx<0?'left':'right';
    else if(dy) facing=dy<0?'up':'down';
  }
  function fitScale() {
    if(!map) return 1;
    const s = Math.max(map.clientWidth/WORLD, map.clientHeight/WORLD, 1);
    window.worldScale = Math.min(s, 2.2);
    return window.worldScale;
  }
  function clampCamera() {
    const s = window.worldScale;
    worldX = Math.max(Math.min(0,map.clientWidth-WORLD*s), Math.min(0,worldX));
    worldY = Math.max(Math.min(0,map.clientHeight-WORLD*s), Math.min(0,worldY));
  }
  function centerCamera() {
    if(!map) return;
    const s = fitScale(), f = feet();
    worldX = map.clientWidth/2 - f.x*s;
    worldY = map.clientHeight*.52 - f.y*s;
    clampCamera(); positionWorld();
  }
  window.recenterTown = () => { if(screen==='map'){ map = document.getElementById('map'); centerCamera(); } };
  window.townView = () => ({x:worldX, y:worldY, s:window.worldScale, w:map?.clientWidth||0, h:map?.clientHeight||0});
  function paint(time) {
    if(!actor) return;
    actor.style.left=state.position.x+'px'; actor.style.top=state.position.y+'px';
    actor.style.zIndex=String(10+Math.round(feet().y/10));
    actor.dataset.direction=facing;
    const col=moving&&!state.settings.reduce ? [0,1,0,2][Math.floor(elapsed/.13)%4] : 0;
    actor.dataset.frame=String(col);
    const sprite=actor.querySelector('.walker');
    sprite.style.backgroundPosition=(col*50)+'% '+(rows[facing]*100/3)+'%';
    let lift=0;
    if(jumpAt){const t=(time-jumpAt)/560;if(t>=1)jumpAt=0;else if(!state.settings.reduce)lift=Math.sin(t*Math.PI)*30;}
    sprite.style.transform='translateY('+(-lift)+'px)';
    actor.classList.toggle('jumping',Boolean(jumpAt));
    actor.classList.toggle('is-walking',moving);
    actor.querySelector('.walker-shadow').style.transform='scale('+(1-lift/90)+')';
  }
  function getNearest() {
    let best=null, distance=Infinity; const f=feet();
    for(const p of places){const [x,y]=door(p.id);const d=Math.hypot(f.x-x,f.y-y);if(d<distance){distance=d;best=p;}}
    return distance<95?best:null;
  }
  function refreshPrompt(time) {
    const prev=nearest;nearest=getNearest();
    if(prev!==nearest){document.querySelectorAll('.town-sign.near').forEach(n=>n.classList.remove('near'));if(nearest)document.querySelector('.town-sign[data-zone="'+nearest.id+'"]')?.classList.add('near');}
    const g=KD.goal();
    const text=time<messageUntil?lastMessage:nearest?'':g?'つぎは '+KD.ZONES[g].kana+' へ':'';
    if(status&&status.textContent!==text){status.textContent=text;status.classList.toggle('here',Boolean(nearest)&&time>=messageUntil);}
    const a=document.querySelector('[data-action="a"]');if(a){a.classList.toggle('ready',Boolean(nearest));a.setAttribute('aria-label',nearest?'A '+KD.ZONES[nearest.id].kana+'に はいる':'A てを ふる');}
  }
  function step(time) {
    if(screen!=='map'||!actor?.isConnected){detach();return;}
    const dt=Math.min((time-last)/1000||0,.05);last=time;
    const blocked=KD.sheetOpen();
    const held=blocked?new Set():new Set([...pointers.values(),...[...keys].map(k=>keyDirections[k])]);
    let dx=Number(held.has('right'))-Number(held.has('left'));
    let dy=Number(held.has('down'))-Number(held.has('up'));
    const manual=Boolean(dx||dy);
    if(manual){target=arrival=null;clearTimeout(visitTimer);}
    else if(target&&!blocked){dx=target.x-state.position.x;dy=target.y-state.position.y;}
    const length=Math.hypot(dx,dy), wasMoving=moving;
    moving=length>.1&&!blocked;
    if(moving){
      direction(dx,dy);
      const distance=manual?SPEED*dt:Math.min(length,SPEED*dt);
      const x=Math.max(0,Math.min(LIMIT_X,state.position.x+dx/length*distance));
      const y=Math.max(0,Math.min(LIMIT_Y,state.position.y+dy/length*distance));
      moving=x!==state.position.x||y!==state.position.y;
      state.position={x,y};elapsed+=dt;
      if(moving&&!pan&&time>panReturn)centerCamera();
      if(!manual&&length<=SPEED*dt+.1){const id=arrival;target=arrival=null;state.facing=facing;save();if(id){openPlace(id);return;}}
    }else elapsed=0;
    if(wasMoving&&!moving){state.facing=facing;save();}
    // Doors open automatically once the feet stand on the doorstep for a moment.
    if(time>entranceCooldown&&moving&&!jumpAt&&!arrival){
      const f=feet();
      const doorway=places.find(p=>{const [x,y]=door(p.id);return Math.hypot(f.x-x,f.y-y)<34});
      if(doorway){
        if(entranceCandidate!==doorway.id){entranceCandidate=doorway.id;entranceAt=time;}
        if(time-entranceAt>100){openPlace(doorway.id);return;}
      }else entranceCandidate=null;
    }
    paint(time);refreshPrompt(time);window.townFrame?.(time,feet());
    frame=requestAnimationFrame(step);
  }
  function openPlace(id){
    entranceCooldown=performance.now()+1800;entranceCandidate=null;target=arrival=null;
    window.playGameSound?.('door');
    const [ex,ey]=KD.ZONES[id].exit; // come back OUTSIDE the door so we never re-enter by accident
    state.position={x:ex-FOOT.x,y:ey-FOOT.y};state.facing='down';facing='down';
    hint=id;if(!state.seen.includes(id))state.seen.push(id);save();
    document.querySelector('.town-play')?.classList.add('leaving');
    setTimeout(()=>show('place'),state.settings.reduce?0:220);
  }
  walk=function(x,y){if(screen!=='map')return;target={x:Math.max(0,Math.min(LIMIT_X,x)),y:Math.max(0,Math.min(LIMIT_Y,y))};arrival=null;panReturn=0;};
  visit=function(id){const z=KD.ZONES[id];if(!z)return;const [x,y]=z.door;if(screen!=='map'){openPlace(id);return;}walk(x-FOOT.x,y-FOOT.y);arrival=id;};
  window.townA=function(){if(screen!=='map'||KD.sheetOpen())return;nearest=getNearest();if(nearest){openPlace(nearest.id);return;}
    facing='down';notify('やっほー！');window.playGameSound?.('tap');actor?.classList.remove('waving');void actor?.offsetWidth;actor?.classList.add('waving');};
  window.townB=function(){if(screen!=='map')return;if(KD.closeSheet())return;if(document.querySelector('.town-menu-panel:not([hidden])')){window.toggleTownMenu?.();return;}
    if(jumpAt)return;jumpAt=performance.now();window.playGameSound?.('jump');notify('ぴょん！',900);};
  function mount(){
    entranceCooldown=performance.now()+1200;
    {const f=feet();const on=places.find(p=>{const [x,y]=door(p.id);return Math.hypot(f.x-x,f.y-y)<60});if(on){const [ex,ey]=KD.ZONES[on.id].exit;state.position={x:ex-FOOT.x,y:ey-FOOT.y};}}
    map=document.getElementById('map');actor=document.getElementById('dragon');
    actor.innerHTML='<span class="walker-shadow"></span><span class="walker" role="img" aria-label="子どもドラゴン"></span>';
    map.insertAdjacentHTML('afterend','<section class="game-controls" aria-label="ゲーム操作"><div class="dpad" role="group" aria-label="いどう">'+[['up','うえ'],['left','ひだり'],['right','みぎ'],['down','した']].map(([d,n])=>'<button class="pad-key '+d+'" data-dir="'+d+'" data-sfx="none" aria-label="'+n+'へ あるく"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 9L32 27H8Z"/></svg></button>').join('')+'<span class="pad-center"></span></div><div class="action-pad"><button class="action-button b-button" data-action="b" data-sfx="none" aria-label="B ジャンプ"><b>B</b><small>ぴょん</small></button><button class="action-button a-button" data-action="a" data-sfx="none" aria-label="A しらべる"><b>A</b><small>はいる</small></button></div><p id="control-status" role="status" aria-live="polite"></p></section>');
    status=document.getElementById('control-status');
    document.querySelectorAll('[data-dir]').forEach(b=>{
      b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b.dataset.dir);b.classList.add('pressed');};
      const release=e=>{pointers.delete(e.pointerId);b.classList.remove('pressed');};
      b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
      b.oncontextmenu=e=>e.preventDefault();
    });
    document.querySelector('[data-action="a"]').onclick=()=>window.townA();
    document.querySelector('[data-action="b"]').onclick=()=>window.townB();
    centerCamera();paint(performance.now());last=performance.now();frame=requestAnimationFrame(step);
  }
  // One pointer handler for the map: tap = walk there, drag = look around (camera returns when walking).
  setupMap=function(){const old=document.getElementById('map'),fresh=old.cloneNode(true);old.replaceWith(fresh);map=fresh;
    fresh.onpointerdown=e=>{if(e.target.closest('button,.kd-backdrop'))return;pan={x:e.clientX,y:e.clientY,wx:worldX,wy:worldY,moved:false};fresh.setPointerCapture(e.pointerId);};
    fresh.onpointermove=e=>{if(!pan)return;const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>10)pan.moved=true;if(pan.moved){worldX=pan.wx+dx;worldY=pan.wy+dy;clampCamera();positionWorld();}};
    fresh.onpointerup=e=>{if(!pan)return;if(!pan.moved){const r=fresh.getBoundingClientRect(),s=window.worldScale;walk((e.clientX-r.left-worldX)/s-FOOT.x,(e.clientY-r.top-worldY)/s-FOOT.y);window.playGameSound?.('move');}else panReturn=performance.now()+1500;pan=null;};
    fresh.onpointercancel=()=>pan=null;positionWorld();};
  window.addEventListener('keydown',e=>{
    if(screen!=='map'||e.target.closest('input,textarea,select'))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(keyDirections[k]){e.preventDefault();keys.add(k);}
    else if(['z','Enter','x',' '].includes(k)&&!e.target.closest('button,a')){e.preventDefault();if(!e.repeat)(k==='z'||k==='Enter'?window.townA:window.townB)();}
  });
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyDirections[k]){keys.delete(k);if(screen==='map')e.preventDefault();}});
  window.addEventListener('blur',()=>stop());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',()=>stop());
  window.addEventListener('resize',()=>{if(screen==='map')centerCamera();});
  render();
})();
