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
function resetKnight(el,type){el.className=`knight ${type} walk`;el.style.transition='none'; if(type==='blue'){el.style.left='-100px';el.style.right='auto';}else{el.style.right='-100px';el.style.left='auto';}}
function patrol(){if(!enabled||document.hidden)return;resetKnight(blue,'blue');requestAnimationFrame(()=>{blue.style.transition='left 12s linear';blue.style.left='calc(100% + 20px)';});timer=setTimeout(battle,14000);}
function battle(){if(!enabled||document.hidden)return;resetKnight(blue,'blue');resetKnight(red,'red');blue.style.left='calc(50% - 95px)';red.style.right='calc(50% - 95px)';blue.style.transition='left 2.8s ease-out';red.style.transition='right 2.8s ease-out';requestAnimationFrame(()=>{blue.style.left='calc(50% - 55px)';red.style.right='calc(50% - 55px)';});setTimeout(()=>{blue.className='knight blue attack';red.className='knight red attack';},2900);setTimeout(()=>{blue.className='knight blue walk';red.className='knight red walk';red.style.transition='right 2.5s ease-in';red.style.right='-120px';},5200);timer=setTimeout(patrol,8500);}
function setMotion(on){enabled=on;clearTimeout(timer);stage.style.display=on?'block':'none';if(on)patrol();}
toggle.addEventListener('change',e=>setMotion(e.target.checked));document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(!document.hidden&&enabled)patrol();});setMotion(enabled);
