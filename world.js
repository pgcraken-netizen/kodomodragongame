/* Illustrated town and gentle side-scrolling forest expedition. */
(() => {
 const townPositions={theater:[120,65],field:[333,80],music:[592,65],shop:[111,265],tailor:[355,265],storage:[585,265],craft:[103,510],square:[350,560],forest:[595,520]};
 for(const p of places){[p.x,p.y]=townPositions[p.id];}
 const oldRender=render,oldShow=show,oldPickup=pickup;
 let dispose=null;
 show=function(s){if(dispose){dispose();dispose=null;}oldShow(s);};
 pickup=function(name){if(name==='まき'){show('forest');return;}oldPickup(name);};
 render=function(){
  if(dispose){dispose();dispose=null;}
  if(screen==='place'&&hint==='forest')screen='forest';
  if(screen==='forest'){renderForest();return;}
  if(screen==='forestDone'){wrap('森の おてつだい、できた！','<div class="forest-complete"><div>'+dragon+'</div><h2>まきを キャンプへ とどけたよ！</h2><p>おちている えだを ３ぼん。<br>きも、もりの なかまも、ありがとう。</p></div>'+btn('🍳 キャンプの じゅんび',"show('cook')",'primary wide')+btn('もういちど 森で あそぶ','replayForest()','primary secondary wide'));return;}
  oldRender();
  if(screen==='map'){
   const world=document.getElementById('world');world.querySelector('.town-art')?.remove();
   world.classList.add('painted-town');
   world.querySelectorAll('.spot').forEach((b,i)=>{const p=places[i];b.classList.add('painted-spot');b.style.background='transparent';b.style.left=(p.x-35)+'px';b.style.top=(p.y-22)+'px';b.setAttribute('aria-label',p.name+'へいく');b.innerHTML='<span class="door-light" aria-hidden="true">✦</span><span class="building-name">'+p.name+'</span>';});
  }
  if(screen==='place'){
   const p=places.find(p=>p.id===hint);const scene=document.createElement('div');scene.className='place-illustration';scene.setAttribute('aria-hidden','true');
   scene.style.backgroundPosition=(p.x/650*100)+'% '+(p.y/650*100)+'%';scene.innerHTML='<div class="place-visitor">'+dragon+'</div>';
   document.querySelector('.dialogue')?.before(scene);
  }
 };
 window.replayForest=function(){state.forest={x:70,sticks:[],delivered:false};save();show('forest');};
 function renderForest(){
  const raw=state.forest;
  state.forest={x:Number.isFinite(raw?.x)?Math.max(40,Math.min(2310,raw.x)):70,sticks:Array.isArray(raw?.sticks)?[...new Set(raw.sticks.filter(n=>Number.isInteger(n)&&n>=0&&n<3))]:[],delivered:Boolean(raw?.delivered)};
  const trip=state.forest;
  el('<main class="forest-game"><header class="forest-header"><button onclick="show(\'map\')" aria-label="町にもどる">← まち</button><div><small>ちいさな もりの ぼうけん</small><h1>おちえだを さがそう</h1></div><strong id="wood-count">'+trip.sticks.length+' / 3</strong></header><div class="forest-viewport"><canvas id="forest-canvas" role="img" aria-label="横スクロールする森。左右で移動、Bでジャンプ、Aで落ち枝を拾います。"></canvas><div class="forest-objective" id="forest-objective">おちえだを３ぼん、キャンプへ！</div><div class="forest-loading" id="forest-loading">森を ひらいているよ…</div></div><div class="forest-message" role="status" aria-live="polite" id="forest-message">→で すすもう。まるたは Bで ぴょん！</div><section class="forest-pad" aria-label="森のゲーム操作"><div class="dpad" role="group" aria-label="森の移動"><button class="pad-key up" data-forest-dir="up" aria-label="うえ・ジャンプ">↑</button><button class="pad-key left" data-forest-dir="left" aria-label="ひだりへ歩く">←</button><span class="pad-center">✦</span><button class="pad-key right" data-forest-dir="right" aria-label="みぎへ歩く">→</button><button class="pad-key down" data-forest-dir="down" aria-label="落ち枝のヒント">↓</button></div><div class="action-pad"><button class="action-button b-button" data-forest-action="b" aria-label="B ジャンプ"><b>B</b><small>ジャンプ</small></button><button class="action-button a-button" data-forest-action="a" aria-label="A ひろう・とどける"><b>A</b><small>ひろう</small></button></div></section><footer class="forest-footer"><button onclick="forestHint()">💡 ヒント</button><button onclick="show(\'cook\')">🍳 キャンプのじゅんび</button><span>じかんぎれは ないよ</span></footer></main>');
  const canvas=document.getElementById('forest-canvas'),ctx=canvas.getContext('2d'),viewport=canvas.parentElement;
  const bg=new Image(),sprite=new Image();bg.src='/assets/forest-painted.webp';sprite.src='/assets/dragon-walk.png';
  let w=390,h=420,x=trip.x,elevation=0,vy=0,facing=2,walkTime=0,raf=0,last=0,camera=0,ready=false,paused=false,stopped=false,wasMoving=false,noticeUntil=0,help=false;
  const keys=new Set(),pointers=new Map(),stickXs=[330,1090,1790],logs=[{x:640,width:88,height:42},{x:1340,width:110,height:50},{x:1990,width:75,height:36}];
  for(const l of logs){if(x+19>l.x&&x-19<l.x+l.width)x=x<l.x+l.width/2?l.x-22:l.x+l.width+22;}
  const msg=document.getElementById('forest-message'),count=document.getElementById('wood-count'),objective=document.getElementById('forest-objective');
  function message(s,hold=1800){if(msg.textContent!==s){msg.textContent=s;say(s);}noticeUntil=performance.now()+hold;}
  function storeTrip(){trip.x=Math.round(x);save();}
  function clear(){keys.clear();pointers.clear();document.querySelectorAll('[data-forest-dir]').forEach(b=>b.classList.remove('pressed'));storeTrip();}
  function resize(){const r=viewport.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function jump(){const supported=elevation<.5||logs.some(l=>Math.abs(elevation-l.height)<1&&x+19>l.x&&x-19<l.x+l.width);if(ready&&!paused&&supported){vy=440;tone();}}
  function nearestStick(){return stickXs.findIndex((p,i)=>!trip.sticks.includes(i)&&Math.abs(x-p)<68&&elevation<85);}
  function act(){if(!ready||paused)return;const i=nearestStick();if(i>=0){trip.sticks.push(i);trip.sticks.sort();count.textContent=trip.sticks.length+' / 3';storeTrip();tone();message('みつけた！ おちえだ '+trip.sticks.length+' / 3');if(trip.sticks.length===3)objective.textContent='３ぼん そろった！ → キャンプへ とどけよう';return;}
   if(Math.abs(x-2240)<105){if(trip.sticks.length===3){trip.delivered=true;state.items['まき']=true;state.branches=3;storeTrip();show('forestDone');}else{help=true;message('まだ '+(3-trip.sticks.length)+'ぼん。← もどって さがそう！');}return;}
   message('きらりと ひかる おちえだの ちかくで A！');
  }
  window.forestHint=function(){help=true;const i=stickXs.findIndex((p,i)=>!trip.sticks.includes(i));message(i<0?'→ いちばん おくの キャンプで A！':(stickXs[i]>x?'→':'←')+' おちえだまで あと '+Math.ceil(Math.abs(stickXs[i]-x)/100)+'ほくらい。まるたは Bで とびこそう！',3500);};
  const dirs={ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right'};
  function keyDown(e){if(screen!=='forest'||e.target.closest('input,textarea'))return;const k=e.key.length===1?e.key.toLowerCase():e.key;
   if(dirs[k]){e.preventDefault();keys.add(k);}else if(['ArrowUp','w','x',' ','z','Enter','ArrowDown','s'].includes(k)&&!e.target.closest('button')){e.preventDefault();if(!e.repeat){if(['ArrowUp','w','x',' '].includes(k))jump();else if(['z','Enter'].includes(k))act();else forestHint();}}
  }
  function keyUp(e){keys.delete(e.key.length===1?e.key.toLowerCase():e.key);}
  document.querySelectorAll('[data-forest-dir]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b.dataset.forestDir);b.classList.add('pressed');if(b.dataset.forestDir==='up')jump();if(b.dataset.forestDir==='down')forestHint();};const release=e=>{pointers.delete(e.pointerId);b.classList.remove('pressed');};b.onpointerup=release;b.onpointercancel=release;b.onlostpointercapture=release;b.oncontextmenu=e=>e.preventDefault();});
  for(const [key,fn]of [['a',act],['b',jump]]){const b=document.querySelector('[data-forest-action="'+key+'"]');b.onpointerdown=e=>{e.preventDefault();fn();};b.onclick=e=>{if(e.detail===0)fn();};}
  // Branches and logs are drawn as hand-lined game objects, rather than emoji UI blocks.
  function branch(px,py,scale=1){ctx.save();ctx.translate(px,py);ctx.scale(scale,scale);ctx.lineCap='round';ctx.lineJoin='round';for(const [color,width]of [['#533b27',9],['#c18a46',5]]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(-22,5);ctx.lineTo(21,-4);ctx.moveTo(-3,1);ctx.lineTo(3,-15);ctx.moveTo(10,-2);ctx.lineTo(18,8);ctx.stroke();}ctx.restore();}
  function log(l,ground){const px=l.x-camera;ctx.save();ctx.lineWidth=3;ctx.strokeStyle='#654729';ctx.fillStyle='#a9773f';ctx.beginPath();ctx.roundRect(px,ground-l.height,l.width,l.height,14);ctx.fill();ctx.stroke();ctx.fillStyle='#e7b56d';ctx.beginPath();ctx.ellipse(px+l.width-12,ground-l.height/2,12,l.height/2-2,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(px+l.width-12,ground-l.height/2,5,l.height/4,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(px+8,ground-l.height+9+i*10);ctx.lineTo(px+l.width-30,ground-l.height+7+i*10);ctx.stroke();}ctx.restore();}
  function draw(time,moving){const ground=h*.82;ctx.clearRect(0,0,w,h);if(!ready)return;
   const tileW=h*bg.width/bg.height,offset=-(camera*.55)%tileW;
   for(let px=offset-tileW;px<w+tileW;px+=tileW)ctx.drawImage(bg,px,0,tileW,h);
   // Footprints make the traversable lane easy to follow.
   ctx.fillStyle='#b58b4760';for(let p=90;p<2360;p+=110){ctx.beginPath();ctx.ellipse(p-camera,ground+6,5,2,-.2,0,Math.PI*2);ctx.fill();}
   logs.forEach(l=>log(l,ground));
   stickXs.forEach((p,i)=>{if(trip.sticks.includes(i))return;branch(p-camera,ground-12);ctx.fillStyle='#fff3a9';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('✦',p-camera,ground-45-(state.settings.reduce?0:Math.sin(time/600+i)*4));if(help){ctx.fillStyle='#fff9df';ctx.beginPath();ctx.arc(p-camera,ground-64,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#685536';ctx.font='bold 16px sans-serif';ctx.fillText('↓',p-camera,ground-58);}});
   // The destination is a physical tent, at the end of the walking route.
   const camp=2240-camera;ctx.strokeStyle='#694426';ctx.lineWidth=4;ctx.fillStyle='#f3c64b';ctx.beginPath();ctx.moveTo(camp-65,ground);ctx.lineTo(camp,ground-116);ctx.lineTo(camp+80,ground);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ad6843';ctx.beginPath();ctx.moveTo(camp-22,ground);ctx.lineTo(camp+2,ground-65);ctx.lineTo(camp+29,ground);ctx.fill();ctx.stroke();ctx.fillStyle='#fff7d8';ctx.fillRect(camp-65,ground-153,139,28);ctx.fillStyle='#65503b';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('キャンプ → A',camp+5,ground-133);
   const footX=x-camera;ctx.fillStyle='#4b583e44';ctx.beginPath();ctx.ellipse(footX,ground+1,26-elevation/22,6,0,0,Math.PI*2);ctx.fill();
   const cellW=sprite.width/3,cellH=sprite.height/4,col=moving&&!state.settings.reduce?[0,1,0,2][Math.floor(walkTime/.13)%4]:0;
   ctx.drawImage(sprite,col*cellW,facing*cellH,cellW,cellH,footX-49,ground-98-elevation,98,98);
   const i=nearestStick();if(i>=0){ctx.fillStyle='#fff8dc';ctx.beginPath();ctx.arc(stickXs[i]-camera,ground-85,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8b6642';ctx.font='bold 18px sans-serif';ctx.fillText('A',stickXs[i]-camera,ground-79);}
   canvas.dataset.x=String(Math.round(x));canvas.dataset.elevation=String(Math.round(elevation));canvas.dataset.camera=String(Math.round(camera));
  }
  function tick(time){if(stopped)return;const dt=Math.min((time-last)/1000||0,.035);last=time;
   let moving=false;
   if(ready&&!paused){const held=new Set([...pointers.values(),...[...keys].map(k=>dirs[k])]);const dx=Number(held.has('right'))-Number(held.has('left'));
    const oldY=elevation;vy-=1050*dt;elevation+=vy*dt;if(elevation<=0){elevation=0;vy=0;}
    // Solid logs support landing from above. Side collisions stop movement without damage.
    for(const l of logs){if(x+19>l.x&&x-19<l.x+l.width&&vy<=0&&oldY>=l.height&&elevation<=l.height){elevation=l.height;vy=0;}}
    let next=Math.max(40,Math.min(2320,x+dx*175*dt));
    for(const l of logs){if(elevation<l.height-1&&next+19>l.x&&next-19<l.x+l.width){if(x<=l.x)next=Math.min(next,l.x-19);else if(x>=l.x+l.width)next=Math.max(next,l.x+l.width+19);if(performance.now()>noticeUntil)message('まるた！ Bで ジャンプしよう',1600);}}
    moving=next!==x;x=next;if(dx)facing=dx<0?1:2;if(moving)walkTime+=dt;else walkTime=0;
    camera=Math.max(0,Math.min(2400-w,x-w*.36));
    if(wasMoving&&!moving)storeTrip();wasMoving=moving;
    if(time>noticeUntil){const i=nearestStick();const text=i>=0?'おちえだ みつけた！ Aで ひろおう':Math.abs(x-2240)<105?'キャンプに とうちゃく！ Aで とどけよう':trip.sticks.length===3?'→ キャンプへ まきを とどけよう':'ひかる おちえだを さがそう。Bで ジャンプ！';if(msg.textContent!==text)msg.textContent=text;}
   }
   draw(time,moving);raf=requestAnimationFrame(tick);
  }
  function blur(){paused=true;clear();}
  function focus(){paused=false;last=performance.now();}
  function visibility(){document.hidden?blur():focus();}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',blur);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',storeTrip);
  const observer=new ResizeObserver(resize);observer.observe(viewport);resize();
  Promise.all([bg.decode(),sprite.decode()]).then(()=>{if(stopped)return;ready=true;document.getElementById('forest-loading')?.remove();last=performance.now();raf=requestAnimationFrame(tick);}).catch(()=>{if(!stopped)document.getElementById('forest-loading').innerHTML='森の画像を よみこめませんでした。<button onclick="show(\'forest\')">もういちど</button>';});
  dispose=()=>{stopped=true;clear();cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',storeTrip);};
 }
 render();
})();
