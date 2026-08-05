const body = document.body;
const cover = document.getElementById('coverScreen');
const story = document.getElementById('story');
const topbar = document.getElementById('topbar');
const dotsWrap = document.querySelector('.dots');
const toast = document.getElementById('toast');
const music = document.getElementById('music');
const soundBtn = document.getElementById('soundBtn');
const rsvpModal = document.getElementById('rsvpModal');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpThanks = document.getElementById('rsvpThanks');
let musicOn = false;

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove('show'),2200);
}

function enterInvitation(){
  story.hidden = false;
  body.classList.remove('locked');
  topbar.classList.add('show');
  story.scrollIntoView({behavior:'smooth'});
  history.replaceState(null,'','#invitation');
  setTimeout(initObserver,100);
}
document.getElementById('openDoor').addEventListener('click', enterInvitation);

const pageSections = [...document.querySelectorAll('.page-card, .rsvp-panel')];
pageSections.forEach((section,index)=>{
  const dot = document.createElement('button');
  dot.className='dot';
  dot.type='button';
  dot.setAttribute('aria-label',`Go to ${section.dataset.title || `page ${index+1}`}`);
  dot.addEventListener('click',()=>section.scrollIntoView({behavior:'smooth',block:'start'}));
  dotsWrap.appendChild(dot);
});

let observersReady = false;
function initObserver(){
  if(observersReady) return;
  observersReady = true;

  const revealObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add('visible')});
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  const pageObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const index=pageSections.indexOf(entry.target);
        document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===index));
      }
    });
  },{threshold:.55});
  pageSections.forEach(el=>pageObserver.observe(el));
}

function updateCountdown(){
  const eventTime = new Date('2026-09-19T10:00:00+08:00').getTime();
  let diff = Math.max(0,eventTime-Date.now());
  const d=Math.floor(diff/86400000); diff%=86400000;
  const h=Math.floor(diff/3600000); diff%=3600000;
  const m=Math.floor(diff/60000); diff%=60000;
  const s=Math.floor(diff/1000);
  document.getElementById('days').textContent=String(d).padStart(2,'0');
  document.getElementById('hours').textContent=String(h).padStart(2,'0');
  document.getElementById('minutes').textContent=String(m).padStart(2,'0');
  document.getElementById('seconds').textContent=String(s).padStart(2,'0');
}
updateCountdown(); setInterval(updateCountdown,1000);

soundBtn.addEventListener('click',async()=>{
  try{
    if(!musicOn){
      await music.play(); musicOn=true; soundBtn.textContent='❚❚'; showToast('Music on');
    }else{
      music.pause(); musicOn=false; soundBtn.textContent='♫'; showToast('Music paused');
    }
  }catch{
    showToast('Add assets/fairy-music.mp3 to enable music');
  }
});

document.querySelectorAll('[data-scroll="0"]').forEach(btn=>btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'})));

document.getElementById('shareInvite').addEventListener('click',async()=>{
  const data={title:"Kamerin's Fairy First",text:"You're invited to Kamerin's Fairy First Birthday & Christening on September 19, 2026!",url:location.href};
  try{if(navigator.share) await navigator.share(data); else {await navigator.clipboard.writeText(location.href);showToast('Invitation link copied');}}
  catch(e){if(e.name!=='AbortError')showToast('Unable to share right now');}
});

document.getElementById('addCalendar').addEventListener('click',()=>{
  const ics=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kamerin Fairy First//EN\r\nBEGIN:VEVENT\r\nUID:kamerin-fairy-first-20260919@example.com\r\nDTSTAMP:20260805T103400Z\r\nDTSTART;TZID=Asia/Manila:20260919T090000\r\nDTEND;TZID=Asia/Manila:20260919T140000\r\nSUMMARY:Kamerin's Fairy First Birthday & Christening\r\nLOCATION:Holy Family Parish Church and Casa La El CICM, Bakakeng North, Baguio City\r\nDESCRIPTION:Godparents seminar at 9:00 AM, ceremony at 10:00 AM, reception lunch at 11:30 AM.\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Kamerin-Fairy-First.ics';a.click();URL.revokeObjectURL(a.href);
  showToast('Calendar file ready');
});

function openRsvpModal(){
  rsvpModal.classList.add('show');
  rsvpModal.setAttribute('aria-hidden','false');
  body.classList.add('modal-open');
  setTimeout(()=>{
    const firstField = rsvpForm.querySelector('input, select, textarea');
    if(firstField) firstField.focus();
  },30);
}

function closeRsvpModal(){
  rsvpModal.classList.remove('show');
  rsvpModal.setAttribute('aria-hidden','true');
  body.classList.remove('modal-open');
}

document.getElementById('openRsvp').addEventListener('click', openRsvpModal);
document.getElementById('openRsvpBottom').addEventListener('click', openRsvpModal);
document.getElementById('closeRsvp').addEventListener('click', closeRsvpModal);
document.querySelectorAll('[data-close-modal="true"]').forEach(el=>el.addEventListener('click', closeRsvpModal));

document.addEventListener('keydown', (event)=>{
  if(event.key === 'Escape' && rsvpModal.classList.contains('show')) closeRsvpModal();
});

rsvpForm.addEventListener('submit', (event)=>{
  event.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm).entries());
  const payload = {
    guestName: data.guestName || '',
    attendance: data.attendance || '',
    guestCount: data.guestCount || '1',
    contact: data.contact || '',
    message: data.message || ''
  };

  localStorage.setItem('kamerinRsvpLatest', JSON.stringify(payload));

  rsvpThanks.hidden = false;
  rsvpThanks.innerHTML = `
    <p><strong>Thank you, ${payload.guestName}!</strong></p>
    <p>Your RSVP has been saved on this device.</p>
    <p><strong>Response:</strong> ${payload.attendance}<br>
    <strong>Guests:</strong> ${payload.guestCount}${payload.contact ? `<br><strong>Contact:</strong> ${payload.contact}` : ''}</p>
    ${payload.message ? `<p><strong>Your message:</strong> ${payload.message}</p>` : ''}
  `;

  showToast('RSVP submitted');
  rsvpForm.reset();
  setTimeout(closeRsvpModal, 1200);
});

if(location.hash==='#invitation') enterInvitation();
