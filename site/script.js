function toggleMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
}

/* Google Analytics (GA4) — se incarca doar dupa consimtamant explicit */
const GA_ID='G-ZHV9T4CBHB';
const SITE_ROOT=((document.currentScript&&document.currentScript.src)||'').replace(/script\.js(\?.*)?$/,'');

function loadGA(){
  if(window.gaLoaded)return;
  window.gaLoaded=true;
  const s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
  document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments);};
  gtag('js',new Date());
  gtag('config',GA_ID);
}

function showCookieBanner(){
  let banner=document.getElementById('cookie-banner');
  if(banner){banner.classList.add('visible');return;}
  banner=document.createElement('div');
  banner.id='cookie-banner';
  banner.className='cookie-banner';
  banner.innerHTML='<p>Folosim Google Analytics pentru a înțelege cum este vizitat acest site. Poți accepta sau refuza — detalii în <a href="'+SITE_ROOT+'politica-de-confidentialitate.html">Politica de confidențialitate</a>.</p>'
    +'<div class="cookie-banner-actions">'
    +'<button class="cookie-btn cookie-btn-decline" id="cookie-decline">Refuz</button>'
    +'<button class="cookie-btn cookie-btn-accept" id="cookie-accept">Accept</button>'
    +'</div>';
  document.body.appendChild(banner);
  document.getElementById('cookie-accept').onclick=function(){
    try{localStorage.setItem('cookie-consent','granted');}catch(e){}
    banner.classList.remove('visible');
    loadGA();
  };
  document.getElementById('cookie-decline').onclick=function(){
    try{localStorage.setItem('cookie-consent','denied');}catch(e){}
    banner.classList.remove('visible');
  };
  requestAnimationFrame(function(){banner.classList.add('visible');});
}

(function initConsent(){
  let consent=null;
  try{consent=localStorage.getItem('cookie-consent');}catch(e){}
  if(consent==='granted'){loadGA();}
  else if(consent!=='denied'){showCookieBanner();}
})();

document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.footer-links').forEach(function(el){
    const a=document.createElement('a');
    a.href='#';
    a.textContent='Cookie-uri';
    a.onclick=function(e){
      e.preventDefault();
      try{localStorage.removeItem('cookie-consent');}catch(err){}
      showCookieBanner();
    };
    el.appendChild(a);
  });
});

async function sendForm(){
  const name=document.getElementById('f-name').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  if(!name||!phone){alert('Completați cel puțin numele și telefonul.');return;}
  if(!document.getElementById('f-consent').checked){alert('Trebuie să fii de acord cu prelucrarea datelor pentru a trimite formularul.');return;}
  const btn=document.querySelector('.contact-form .btn-primary');
  btn.disabled=true;btn.textContent='Se trimite...';
  try{
    const res=await fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        access_key:'99f18de4-05e8-460c-b213-b780659f9429',
        subject:'Cerere ofertă nouă — PELTECH',
        name,
        phone:phone,
        email:document.getElementById('f-email').value.trim()||'(necompletat)',
        'Tip lucrare':document.getElementById('f-type').value||'(nespecificat)',
        message:document.getElementById('f-msg').value.trim()||'(fără mesaj)'
      })
    });
    const d=await res.json();
    if(d.success){
      document.getElementById('form-success').style.display='block';
      ['f-name','f-phone','f-email','f-type','f-msg'].forEach(id=>document.getElementById(id).value='');
      document.getElementById('f-consent').checked=false;
    }else{
      alert('Eroare la trimitere. Contactați-ne telefonic.');
    }
  }catch(e){
    alert('Eroare la trimitere. Contactați-ne telefonic.');
  }
  btn.disabled=false;btn.textContent='Trimite mesajul →';
}

// Scroll: nav opacity + parallax
const nav=document.getElementById('navbar');
const heroBg=document.querySelector('.hero-bg');
const heroGrid=document.querySelector('.hero-grid');
const heroImg=document.querySelector('.hero-img img');
const parallaxEls=document.querySelectorAll('.parallax-bg');

let rafPending=false;

function updateScroll(){
  rafPending=false;
  const scrollY=window.scrollY;

  nav.style.background=scrollY>100?'rgba(17,17,17,0.98)':'rgba(17,17,17,0.92)';

  if(window.innerWidth>900){
    if(heroBg) heroBg.style.transform=`translateY(${scrollY*0.3}px)`;
    if(heroGrid) heroGrid.style.transform=`translateY(${scrollY*0.15}px)`;
    if(heroImg) heroImg.style.transform=`translateY(${scrollY*0.2}px)`;
    parallaxEls.forEach(el=>{
      const rect=el.getBoundingClientRect();
      const offset=(rect.top+rect.height/2-window.innerHeight/2)*0.15;
      el.style.transform=`translateY(${offset}px)`;
    });
  }
}

window.addEventListener('scroll',()=>{
  if(!rafPending){
    rafPending=true;
    requestAnimationFrame(updateScroll);
  }
},{passive:true});

// Counter animation
function animateCounter(el){
  const target=parseInt(el.dataset.target);
  const suffix=el.dataset.suffix||'';
  const duration=1800;
  const step=target/duration*16;
  let current=0;
  const timer=setInterval(()=>{
    current+=step;
    if(current>=target){
      current=target;
      clearInterval(timer);
    }
    el.textContent=Math.floor(current)+suffix;
  },16);
}

// Intersection Observer: counters + fade-in sections
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      if(entry.target.classList.contains('hero-stat-num')&&entry.target.dataset.target){
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
      if(entry.target.classList.contains('fade-in-section')){
        entry.target.classList.add('visible');
      }
    }
  });
},{threshold:0.05,rootMargin:'0px 0px 80px 0px'});

document.querySelectorAll('.hero-stat-num[data-target]').forEach(el=>observer.observe(el));
document.querySelectorAll('.fade-in-section').forEach(el=>observer.observe(el));

// Title reveal
const titleObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      titleObserver.unobserve(entry.target);
    }
  });
},{threshold:0.1,rootMargin:'0px 0px 60px 0px'});
document.querySelectorAll('.section-title').forEach(el=>titleObserver.observe(el));

// Staggered service cards
const cardObserver=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      cardObserver.unobserve(entry.target);
    }
  });
},{threshold:0,rootMargin:'0px 0px 120px 0px'});

document.querySelectorAll('.service-card').forEach((card,i)=>{
  card.style.transitionDelay=`${i*0.06}s`;
  cardObserver.observe(card);
});

// Close mobile menu on outside click
document.addEventListener('click',e=>{
  const menu=document.getElementById('mobileMenu');
  const hamburger=document.querySelector('.hamburger');
  if(menu.classList.contains('open')&&!menu.contains(e.target)&&!hamburger.contains(e.target)){
    menu.classList.remove('open');
  }
});
