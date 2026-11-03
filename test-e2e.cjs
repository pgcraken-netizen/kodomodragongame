// End-to-end playthrough on a phone-sized viewport.
// Usage: python3 -m http.server 8000 &  then  node test-e2e.cjs [screenshotDir]
// Uses the Playwright/Chromium available on the machine (no install step).
const {chromium}=require('playwright');
const assert=require('assert');
const URL=process.env.GAME_URL||'http://localhost:8000';
const SHOTS=process.argv[2]||'';
(async()=>{
 const browser=await chromium.launch();
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&!r.url().includes('fonts.g'))errors.push(r.status()+' '+r.url())});
 const shot=async n=>{if(SHOTS)await page.screenshot({path:SHOTS+'/'+n+'.png'})};
 const ev=s=>page.evaluate(s);
 const wait=ms=>page.waitForTimeout(ms);
 await page.goto(URL);await ev('localStorage.clear()');await page.reload();await wait(600);
 await shot('01-cover');
 await page.click('.cover-play');await wait(800);
 assert.equal(await ev('screen'),'map');
 assert.ok(await page.isVisible('.kd-sheet.story'),'mission intro is shown');
 await shot('02-intro');
 await page.click('.kd-sheet .kd-btn.go');await wait(400);
 await shot('03-town');
 // The map fills the whole screen and the pads float on top of it.
 const box=await page.locator('#map').boundingBox();assert.ok(box.height>=840,'map is full height');
 assert.ok(await ev('worldScale')>=1.08,'town is scaled to cover tall phones');
 assert.equal(await page.locator('.guide-marker').count(),1,'goal marker');
 // Walk with the d-pad to the craft room (goal) using real pointer holds.
 const holdUntil=async(dir,test,ms=6000)=>{const b=await page.locator('[data-dir="'+dir+'"]').first().boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();const t=Date.now();while(Date.now()-t<ms&&!(await ev(test)))await wait(40);await page.mouse.up();};
 await holdUntil('left',"state.position.x+46<=140||screen!=='map'");
 await holdUntil('down',"screen==='place'",8000);
 await wait(400);
 assert.equal(await ev('screen+hint'),'placecraft','entered craft room by walking onto the door');
 await wait(500);await shot('04-craft');
 // Tap the item: the dragon walks there and picks it up by touching it.
 await page.locator('.room-pickup').first().click({force:true});
 await page.waitForSelector('.kd-sheet.got',{timeout:6000});await shot('05-got');
 assert.ok(await ev("state.items['にんぎょう']"));
 await wait(2300);
 assert.equal(await page.locator('.room-pickup').count(),0,'item removed from scene');
 // side quest
 await page.locator('.room-quest').click({force:true});await wait(3500);
 assert.ok(await ev('state.side.hat'),'side quest solved');
 await shot('06-quest');
 await page.click('.room-back');await wait(700);
 assert.equal(await ev('screen'),'map');
 assert.ok(await ev("Math.hypot(state.position.x+46-KD.ZONES.craft.door[0],state.position.y+98-KD.ZONES.craft.door[1])>50"),'returned outside the door');
 await wait(1600);assert.equal(await ev('screen'),'map','no accidental re-entry');
 await shot('07-town-flowers');
 // Other chapter-1 rooms: enter via guide, collect by tapping.
 for(const z of ['tailor','music','storage']){
  await ev(`visit('${z}')`);await page.waitForFunction(`screen==='place'&&hint==='${z}'`,{timeout:15000});await wait(500);
  if(z==='music')await shot('08-music');
  while(await page.locator('.room-pickup').count()){await page.locator('.room-pickup').first().click({force:true});await page.waitForSelector('.kd-sheet.got',{timeout:6000});await wait(2300);}
  await page.click('.room-back');await wait(700);
 }
 assert.equal(await ev('collected()+"/"+total()'),'4/4');
 assert.equal(await ev('KD.goal()'),'theater');
 await ev("visit('theater')");await page.waitForFunction("screen==='place'&&hint==='theater'",{timeout:15000});await wait(500);
 await shot('09-theater');
 await page.click('.room-special.on',{force:true});await page.waitForFunction("screen==='stage'",{timeout:6000});
 await shot('10-stage');
 for(const b of await page.locator('.prop-btn').all())await b.click({force:true});
 await page.waitForFunction("screen==='untangle'",{timeout:4000});await shot('11-untangle');
 for(let i=1;i<=4;i++)await page.click('[data-k="'+i+'"]',{force:true});
 await page.waitForFunction("screen==='curtain'",{timeout:4000});await shot('12-curtain');
 await page.click('#openBtn');await wait(1500);await shot('13-show');
 await page.waitForSelector('.kd-sheet',{timeout:9000});await shot('14-stamp');
 assert.ok(await ev('state.done[0]&&state.chapter===1'));
 await page.click('.kd-sheet .kd-btn.go');await wait(400);
 assert.equal(await ev('screen'),'cook');await shot('15-cook');
 await page.locator('.recipe').nth(1).click();await wait(200);assert.equal(await ev('state.meal'),'やさいスープ');
 await page.locator('.recipe').nth(0).click();await wait(200);
 await page.click('.kd-btn.go.big');await wait(800);
 assert.ok(await page.isVisible('.kd-sheet.story'),'camp intro');await shot('16-camp-intro');
 await page.click('.kd-sheet .kd-btn.go');await wait(300);
 // Shop: onion is sold out -> ask at the square.
 await ev("visit('shop')");await page.waitForFunction("screen==='place'&&hint==='shop'",{timeout:15000});await wait(500);await shot('17-shop');
 while(await page.locator('.room-pickup').count()){await page.locator('.room-pickup').first().click({force:true});await wait(3000);if(await page.isVisible('.kd-sheet.got'))await wait(1500);}
 assert.ok(await ev('state.shortage&&!state.items["たまねぎ"]&&state.items["カレールウ"]'),'onion sold out, roux taken');
 await page.click('.room-back');await wait(700);
 for(const z of ['field','square']){
  await ev(`visit('${z}')`);await page.waitForFunction(`screen==='place'&&hint==='${z}'`,{timeout:15000});await wait(500);await shot('18-'+z);
  while(await page.locator('.room-pickup').count()){await page.locator('.room-pickup').first().click({force:true});await page.waitForSelector('.kd-sheet.got',{timeout:6000});await wait(2300);}
  await page.click('.room-back');await wait(700);
 }
 // Firewood: the forest side-scroller.
 await ev("visit('forest')");await page.waitForFunction("screen==='place'&&hint==='forest'",{timeout:15000});await wait(500);await shot('19-camp');
 await page.locator('.room-pickup').first().click({force:true});await page.waitForFunction("screen==='forest'",{timeout:8000});
 await page.waitForSelector('#forest-loading',{state:'detached',timeout:8000});await shot('20-forest');
 await ev("state.forest={x:2240,sticks:[0,1,2],delivered:false};show('forest')");await page.waitForSelector('#forest-loading',{state:'detached'});
 await page.locator('[data-forest-action="a"]').dispatchEvent('pointerdown');await page.waitForFunction("screen==='forestDone'");await shot('21-wood');
 await page.click('.kd-btn.go');await page.waitForFunction("screen==='place'&&hint==='forest'");await wait(500);
 assert.equal(await ev('collected()+"/"+total()'),'6/6');
 await page.click('.room-special.on',{force:true});await page.waitForFunction("screen==='mix'",{timeout:6000});await shot('22-mix');
 for(let i=0;i<5;i++){await page.click('#pot',{force:true});await wait(500);}
 await page.waitForFunction("screen==='feast'",{timeout:4000});await shot('23-feast');
 assert.ok(await ev('state.done[1]'));
 await page.click('.kd-btn.go.big');await page.waitForFunction("screen==='stars'");
 for(let i=0;i<7;i++)await page.click('[data-s="'+i+'"]',{force:true});await wait(900);await shot('24-stars');
 assert.ok(await page.isVisible('#nightBtns'));
 await page.click('#nightBtns .kd-btn.go');await page.waitForFunction("screen==='fireworks'");
 const sky=await page.locator('#fwSky').boundingBox();
 for(let i=0;i<5;i++){await page.mouse.click(sky.x+60+i*50,sky.y+120+(i%2)*60);await wait(150);}
 await wait(300);await shot('25-fireworks');
 assert.ok((await page.textContent('#fwNote')).includes('ハート'));
 await ev("show('book')");await wait(300);await shot('26-book');
 await ev("show('help')");await wait(300);await shot('27-help');
 // Save + reload keeps progress, and the menu shows night events.
 await page.reload();await wait(500);assert.ok(await ev('state.done[0]&&state.done[1]&&state.side.hat'));
 await ev("show('map')");await wait(900);if(await page.isVisible('.kd-sheet'))await ev('KD.closeSheet(true)');
 await page.click('.town-menu-toggle');await wait(300);await shot('28-menu');
 assert.ok(await page.isVisible('.kd-tile >> text=はなび'));
 await page.click('.kd-x');await wait(200);
 // Escape (and tapping outside) closes the menu.
 await page.click('.town-menu-toggle');await wait(200);await page.keyboard.press('Escape');await wait(200);
 assert.ok(!(await ev('KD.sheetOpen()')),'menu closes');
 await page.setViewportSize({width:320,height:568});await ev("show('map')");await wait(600);await shot('29-small-town');
 await ev("hint='square';show('place')");await wait(600);await shot('30-small-room');
 assert.deepEqual(errors,[],'no JS errors or failed requests');
 console.log('E2E OK');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
