function toggleMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
}

async function sendForm(){
  const name=document.getElementById('f-name').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  if(!name||!phone){alert('Completați cel puțin numele și telefonul.');return;}
  const btn=document.querySelector('.contact-form .btn-primary');
  btn.disabled=true;btn.textContent='Se trimite...';
  try{
    const res=await fetch('/send-mail.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name,phone,
        email:document.getElementById('f-email').value.trim(),
        type:document.getElementById('f-type').value,
        message:document.getElementById('f-msg').value.trim()
      })
    });
    const d=await res.json();
    if(d.ok){
      document.getElementById('form-success').style.display='block';
      ['f-name','f-phone','f-email','f-type','f-msg'].forEach(id=>document.getElementById(id).value='');
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
