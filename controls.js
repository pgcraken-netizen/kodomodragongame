/* Continuous movement and four-direction sprite atlas. No framework dependency. */
(() => {
  const SPEED = 155, LIMIT_X = 690, LIMIT_Y = 675;
  const rows = {down:0,left:1,right:2,up:3};
  let facing = rows[state.facing] === undefined ? 'down' : state.facing;
  let frame = 0, last = 0, elapsed = 0, target = null, arrival = null;
  let jumpAt = 0, moving = false, actor = null, map = null, status = null;
  let entranceCooldown=performance.now()+1500, entranceCandidate=null, entranceAt=0;
  let nearest = null, lastMessage = '', messageUntil = 0, pan = null;
  const pointers = new Map(), keys = new Set();
  const keyDirections = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
  const oldRender = render, oldShow = show;
  function stop(savePosition = true) {
    pointers.clear(); keys.clear(); target = arrival = null; pan = null;
    moving = false; jumpAt = 0; elapsed = 0;
    document.querySelectorAll('.pad-key.pressed').forEach(b => b.classList.remove('pressed'));
    if(savePosition) { state.facing = facing; save(); }
  }
  function detach() {
    stop(); cancelAnimationFrame(frame); frame = 0; actor = map = status = null;
  }
  show = function(s) { detach(); oldShow(s); };
  render = function() {
    detach(); oldRender();
    if(screen === 'map') mount();
    if(screen === 'help') document.querySelector('.card')?.insertAdjacentHTML('afterbegin',
      '<p>🎮 十字キーを おしつづけると あるくよ。</p><p>🅰 たてものの ちかくで おはなし。🅱 ジャンプ！</p><p>キーボード：矢印 / WASD で移動、Z / Enter でA、X / Space でB。</p>');
  };
  function notify(message) {
    lastMessage = message; messageUntil = performance.now()+1800;
    if(status) status.textContent = message;
    say(message);
  }
  function direction(dx,dy) {
    if(Math.abs(dx)>Math.abs(dy)) facing=dx<0?'left':'right';
    else if(dy) facing=dy<0?'up':'down';
  }
  function centerCamera() {
    if(!map) return;
    worldX=Math.max(Math.min(0,map.clientWidth-780),Math.min(0,map.clientWidth/2-state.position.x-46));
    worldY=Math.max(Math.min(0,map.clientHeight-780),Math.min(0,map.clientHeight/2-state.position.y-55));
    positionWorld();
  }
  function paint(time) {
    if(!actor) return;
    actor.style.left=state.position.x+'px'; actor.style.top=state.position.y+'px';
    actor.dataset.direction=facing;
    // Four columns of positions would imply 33% increments; this atlas has THREE columns.
    const col=moving&&!state.settings.reduce ? [0,1,0,2][Math.floor(elapsed/.13)%4] : 0;
    actor.dataset.frame=String(col);
    const sprite=actor.querySelector('.walker');
    sprite.style.backgroundPosition=(col*50)+'% '+(rows[facing]*100/3)+'%';
    let lift=0;
    if(jumpAt){const t=(time-jumpAt)/560;if(t>=1)jumpAt=0;else if(!state.settings.reduce)lift=Math.sin(t*Math.PI)*30;}
    sprite.style.transform='translateY('+(-lift)+'px)';
    actor.classList.toggle('jumping',Boolean(jumpAt));
    actor.classList.toggle('is-walking',moving);
    const shadow=actor.querySelector('.walker-shadow');shadow.style.transform='scale('+(1-lift/90)+')';
  }
  function getNearest() {
    let best=null, distance=Infinity;
    for(const p of places){const d=Math.hypot(state.position.x-(p.x+32),state.position.y-(p.y+100));if(d<distance){distance=d;best=p;}}
    return distance<112?best:null;
  }
  function refreshPrompt(time) {
    nearest=getNearest();
    const text=time<messageUntil?lastMessage:nearest?'🚪 '+nearest.name+'の とびらへ！':'十字キーで とびらへ ・ Aで しらべる';
    if(status&&status.textContent!==text)status.textContent=text;
    const a=document.querySelector('[data-action="a"]');if(a){a.classList.toggle('ready',Boolean(nearest));a.setAttribute('aria-label',nearest?'A '+nearest.name+'をしらべる':'A 手をふる');}
  }
  function step(time) {
    if(screen!=='map'||!actor?.isConnected){detach();return;}
    const dt=Math.min((time-last)/1000||0,.05);last=time;
    const held=new Set([...pointers.values(),...[...keys].map(k=>keyDirections[k])]);
    let dx=Number(held.has('right'))-Number(held.has('left'));
    let dy=Number(held.has('down'))-Number(held.has('up'));
    const manual=Boolean(dx||dy);
    if(manual){target=arrival=null;clearTimeout(visitTimer);}
    else if(target){dx=target.x-state.position.x;dy=target.y-state.position.y;}
    const length=Math.hypot(dx,dy), wasMoving=moving;
    moving=length>.1;
    if(moving){
      direction(dx,dy);
      const distance=manual?SPEED*dt:Math.min(length,SPEED*dt);
      const x=Math.max(0,Math.min(LIMIT_X,state.position.x+dx/length*distance));
      const y=Math.max(0,Math.min(LIMIT_Y,state.position.y+dy/length*distance));
      moving=x!==state.position.x||y!==state.position.y;
      state.position={x,y};elapsed+=dt;
      if(moving)centerCamera();
      if(!manual&&length<=SPEED*dt+.1){const id=arrival;target=arrival=null;state.facing=facing;save();if(id){openPlace(id);return;}}
    }else elapsed=0;
    if(wasMoving&&!moving){state.facing=facing;save();}
    // Doors activate automatically after the player stands at their entrance.
    // Re-entry is suppressed briefly after returning from a building.
    if(time>entranceCooldown&&moving&&!jumpAt){
      const doorway=places.find(p=>Math.hypot(state.position.x-(p.x+32),state.position.y-(p.y+100))<36);
      if(doorway){
        if(entranceCandidate!==doorway.id){entranceCandidate=doorway.id;entranceAt=time;}
        if(time-entranceAt>100){entranceCooldown=time+1700;entranceCandidate=null;target=arrival=null;window.playGameSound?.('arrive');openPlace(doorway.id);return;}
      }else entranceCandidate=null;
    }
    paint(time);refreshPrompt(time);frame=requestAnimationFrame(step);
  }
  function openPlace(id){entranceCooldown=performance.now()+1800;hint=id;if(!state.seen.includes(id))state.seen.push(id);save();show('place');}
  walk=function(x,y){if(screen!=='map')return;target={x:Math.max(0,Math.min(LIMIT_X,x)),y:Math.max(0,Math.min(LIMIT_Y,y))};arrival=null;};
  visit=function(id){const p=places.find(p=>p.id===id);if(!p)return;if(screen!=='map'){state.position={x:p.x+32,y:p.y+100};openPlace(id);return;}walk(p.x+32,p.y+100);arrival=id;};
  function actionA(){if(screen!=='map')return;nearest=getNearest();if(nearest)openPlace(nearest.id);else{facing='down';notify('やっほー！ たてものの ちかくで Aを おしてね');actor?.classList.remove('waving');void actor?.offsetWidth;actor?.classList.add('waving');}}
  function actionB(){if(screen!=='map'||jumpAt)return;jumpAt=performance.now();tone();notify('ぴょん！');}
  function mount(){
    entranceCooldown=performance.now()+1500;
    map=document.getElementById('map');actor=document.getElementById('dragon');
    actor.innerHTML='<span class="walker-shadow"></span><span class="walker" role="img" aria-label="子どもドラゴン"></span>';
    document.querySelector('.map-tip').textContent='十字キーで とびらへ いくと はいれるよ！';
    map.insertAdjacentHTML('afterend','<section class="game-controls" aria-label="ゲーム操作"><div class="dpad" role="group" aria-label="移動キー">'+[['up','↑','うえ'],['left','←','ひだり'],['right','→','みぎ'],['down','↓','した']].map(([d,s,n])=>'<button class="pad-key '+d+'" data-dir="'+d+'" aria-label="'+n+'へ移動">'+s+'</button>').join('')+'<span class="pad-center">✦</span></div><div class="action-pad"><button class="action-button b-button" data-action="b" aria-label="B ジャンプ"><b>B</b><small>ジャンプ</small></button><button class="action-button a-button" data-action="a" aria-label="A しらべる"><b>A</b><small>しらべる</small></button></div><p id="control-status" role="status" aria-live="polite"></p></section>');
    status=document.getElementById('control-status');
    document.querySelectorAll('[data-dir]').forEach(b=>{
      b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b.dataset.dir);b.classList.add('pressed');};
      const release=e=>{pointers.delete(e.pointerId);b.classList.remove('pressed');};
      b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;
      b.oncontextmenu=e=>e.preventDefault();
    });
    document.querySelector('[data-action="a"]').onclick=actionA;
    document.querySelector('[data-action="b"]').onclick=actionB;
    centerCamera();paint(performance.now());last=performance.now();frame=requestAnimationFrame(step);
  }
  // Replace the legacy drag handler so camera gestures and gamepad movement share one position.
  setupMap=function(){const old=document.getElementById('map'),fresh=old.cloneNode(true);old.replaceWith(fresh);map=fresh;
    fresh.onpointerdown=e=>{if(e.target.closest('button'))return;pan={x:e.clientX,y:e.clientY,wx:worldX,wy:worldY,moved:false};fresh.setPointerCapture(e.pointerId);};
    fresh.onpointermove=e=>{if(!pan)return;const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>8)pan.moved=true;if(pan.moved){target=arrival=null;worldX=Math.max(Math.min(0,fresh.clientWidth-780),Math.min(0,pan.wx+dx));worldY=Math.max(Math.min(0,fresh.clientHeight-780),Math.min(0,pan.wy+dy));positionWorld();}};
    fresh.onpointerup=e=>{if(!pan)return;if(!pan.moved){const r=fresh.getBoundingClientRect();walk(e.clientX-r.left-worldX-46,e.clientY-r.top-worldY-60);}pan=null;};fresh.onpointercancel=()=>pan=null;positionWorld();};
  window.addEventListener('keydown',e=>{
    if(screen!=='map'||e.target.closest('input,textarea,select'))return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(keyDirections[k]){e.preventDefault();keys.add(k);}
    else if(['z','Enter','x',' '].includes(k)&&!e.target.closest('button,a')){e.preventDefault();if(!e.repeat)(k==='z'||k==='Enter'?actionA:actionB)();}
  });
  window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyDirections[k]){keys.delete(k);if(screen==='map')e.preventDefault();}});
  window.addEventListener('blur',()=>stop());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',()=>stop());
  window.addEventListener('resize',()=>{if(screen==='map')centerCamera();});
  render();
})();
