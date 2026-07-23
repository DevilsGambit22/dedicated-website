const CLUB = 'and-chess-for-all-official';
const API = 'https://api.chess.com/pub';
const pages = [...document.querySelectorAll('[data-page]')];
const navLinks = [...document.querySelectorAll('nav a')];
const menu = document.querySelector('.menu-button');
const nav = document.querySelector('nav');

function showPage(){
  const id=(location.hash||'#home').slice(1);
  pages.forEach(el=>el.classList.toggle('active-page',el.dataset.page===id));
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${id}`));
  nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); window.scrollTo({top:0});
}
addEventListener('hashchange',showPage); showPage();
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});

function setGreeting(){
  const hour=new Date().getHours();
  const greeting=hour<5?'Welcome, night owl':hour<12?'Good morning':hour<17?'Good afternoon':hour<21?'Good evening':'Welcome this evening';
  document.querySelector('#greeting').textContent=`${greeting} — welcome to ACFA`;
}
setGreeting(); document.querySelector('#year').textContent=new Date().getFullYear();

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function getJSON(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`${r.status}`);return r.json();}
function matchCard(m,label){
 const title=m.name||m.opponent||'Club match';
 const url=m.url||m.match_url||`https://www.chess.com/clubs/matches/${CLUB}`;
 const start=m.start_time?new Date(m.start_time*1000).toLocaleString():label;
 return `<article><p class="eyebrow">${esc(label)}</p><h3>${esc(title)}</h3><p>${esc(start)}</p><a href="${esc(url)}" target="_blank" rel="noopener">Open on Chess.com</a></article>`;
}
async function loadEvents(){
 const status=document.querySelector('#events-status'), grid=document.querySelector('#events-grid');
 status.textContent='Loading public Chess.com club data…'; grid.innerHTML='';
 try{
  const [club,matches,members]=await Promise.all([
   getJSON(`${API}/club/${CLUB}`),
   getJSON(`${API}/club/${CLUB}/matches`),
   getJSON(`${API}/club/${CLUB}/members`)
  ]);
  const current=matches.in_progress||matches.current||[];
  const upcoming=matches.upcoming||matches.scheduled||[];
  const memberTotal=['weekly','monthly','all_time'].reduce((n,k)=>n+(members[k]?.length||0),0);
  document.querySelector('#member-count').textContent=club.members_count??memberTotal??'—';
  document.querySelector('#current-count').textContent=current.length;
  document.querySelector('#upcoming-count').textContent=upcoming.length;
  const cards=[...current.slice(0,3).map(m=>matchCard(m,'IN PROGRESS')),...upcoming.slice(0,3).map(m=>matchCard(m,'UPCOMING'))];
  grid.innerHTML=cards.length?cards.join(''):`<article><h3>No public match data is currently listed</h3><p>Visit the Chess.com club events page for arenas, Vote Chess, Swiss tournaments, and newly created events.</p><a href="https://www.chess.com/clubs/events/${CLUB}" target="_blank" rel="noopener">View all club events</a></article>`;
  status.textContent=`Public data updated ${new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}.`;
 }catch(e){
  document.querySelector('#member-count').textContent='—';document.querySelector('#current-count').textContent='—';document.querySelector('#upcoming-count').textContent='—';
  status.textContent='Live Chess.com data is temporarily unavailable.';
  grid.innerHTML=`<article><h3>Open the official events page</h3><p>The website could not reach the public API. Club activity is still available directly on Chess.com.</p><a href="https://www.chess.com/clubs/events/${CLUB}" target="_blank" rel="noopener">View ACFA events</a></article>`;
 }
}
document.querySelector('#refresh-events').addEventListener('click',loadEvents); loadEvents();

const stage=document.querySelector('#knight-stage'), blue=document.querySelector('#blue-knight'), red=document.querySelector('#red-knight'), toggle=document.querySelector('#motion-toggle');
let enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches, timer;
toggle.checked=enabled;

function setKnightState(el,type,state){
  el.className=`knight ${type} ${state}`;
}
function resetKnight(el,type){
  setKnightState(el,type,'walk');
  el.style.transition='none';
  if(type==='blue'){
    el.style.left='-120px';
    el.style.right='auto';
    el.style.transform='none';
  }else{
    el.style.right='-120px';
    el.style.left='auto';
    el.style.transform='scaleX(-1)';
  }
}
function after(ms,fn){timer=setTimeout(fn,ms);}
function patrol(){
  if(!enabled||document.hidden)return;
  resetKnight(blue,'blue');
  red.style.display='none';
  requestAnimationFrame(()=>{
    blue.style.transition='left 12s linear';
    blue.style.left='calc(100% + 20px)';
  });
  after(13500,spar);
}
function spar(){
  if(!enabled||document.hidden)return;
  red.style.display='block';
  resetKnight(blue,'blue');
  resetKnight(red,'red');
  blue.style.left='-110px';
  red.style.right='-110px';
  requestAnimationFrame(()=>{
    blue.style.transition='left 3.2s ease-out';
    red.style.transition='right 3.2s ease-out';
    blue.style.left='calc(50% - 88px)';
    red.style.right='calc(50% - 88px)';
  });

  setTimeout(()=>{setKnightState(blue,'blue','idle');setKnightState(red,'red','idle');},3250);
  setTimeout(()=>{setKnightState(blue,'blue','attack');setKnightState(red,'red','guard');},3900);
  setTimeout(()=>{setKnightState(blue,'blue','guard');setKnightState(red,'red','attack');},5000);
  setTimeout(()=>{setKnightState(blue,'blue','attack');setKnightState(red,'red','hurt');},6100);
  setTimeout(()=>{setKnightState(blue,'blue','hurt');setKnightState(red,'red','attack');},7100);
  setTimeout(()=>{setKnightState(blue,'blue','guard');setKnightState(red,'red','guard');},8100);
  setTimeout(()=>{setKnightState(blue,'blue','attack');setKnightState(red,'red','attack');stage.classList.add('clash');},9000);
  setTimeout(()=>{stage.classList.remove('clash');setKnightState(blue,'blue','idle');setKnightState(red,'red','idle');},10100);
  setTimeout(()=>{
    setKnightState(blue,'blue','walk');
    setKnightState(red,'red','walk');
    blue.style.transition='left 3s ease-in';
    red.style.transition='right 3s ease-in';
    blue.style.left='-120px';
    red.style.right='-120px';
  },10900);
  after(14300,patrol);
}
function setMotion(on){
  enabled=on;
  clearTimeout(timer);
  stage.classList.remove('clash');
  stage.style.display=on?'block':'none';
  if(on)patrol();
}
toggle.addEventListener('change',e=>setMotion(e.target.checked));
document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden&&enabled)patrol();});
setMotion(enabled);

// Subtle gold matrix background shared across every page.
(() => {
  const canvas = document.querySelector('#gold-matrix');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  const glyphs = '♔♕♖♗♘♙01ACFA';
  let columns = 0;
  let drops = [];
  let raf = 0;
  let last = 0;
  const fontSize = 18;

  function resize(){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    columns = Math.ceil(innerWidth / fontSize);
    drops = Array.from({length:columns},()=>Math.random() * -45);
  }
  function draw(time){
    if (time-last > 72){
      ctx.fillStyle='rgba(7,7,7,.11)';
      ctx.fillRect(0,0,innerWidth,innerHeight);
      ctx.font=`600 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign='center';
      for(let i=0;i<drops.length;i++){
        const char=glyphs[Math.floor(Math.random()*glyphs.length)];
        const y=drops[i]*fontSize;
        const glow=Math.random()>.93;
        ctx.fillStyle=glow?'rgba(255,231,168,.88)':'rgba(199,165,91,.50)';
        if(glow){ctx.shadowBlur=10;ctx.shadowColor='rgba(199,165,91,.8)'}
        else ctx.shadowBlur=0;
        ctx.fillText(char,i*fontSize+fontSize/2,y);
        if(y>innerHeight+80 && Math.random()>.975)drops[i]=Math.random()*-12;
        drops[i]+=.42+Math.random()*.18;
      }
      last=time;
    }
    raf=requestAnimationFrame(draw);
  }
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf)}else{raf=requestAnimationFrame(draw)}
  });
  resize();
  raf=requestAnimationFrame(draw);
})();
