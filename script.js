(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const header = $('[data-header]');
  const setHeader = () => header && header.classList.toggle('is-scrolled', scrollY > 20);
  setHeader(); addEventListener('scroll', setHeader, {passive:true});

  const current = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a,.mobile-panel a,.footer a').forEach(a => { if (a.getAttribute('href') === current) a.classList.add('is-active'); });

  const toggle = $('.menu-toggle'), panel = $('.mobile-panel');
  const closeMenu = () => { document.body.classList.remove('menu-open'); panel?.classList.remove('is-open'); panel?.setAttribute('aria-hidden','true'); toggle?.setAttribute('aria-expanded','false'); };
  const openMenu = () => { document.body.classList.add('menu-open'); panel?.classList.add('is-open'); panel?.setAttribute('aria-hidden','false'); toggle?.setAttribute('aria-expanded','true'); };
  toggle?.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
  $$('.mobile-panel a').forEach(a => a.addEventListener('click', closeMenu));

  const ensurePlaceholder = frame => { if (!$('.image-placeholder', frame)) { const ph=document.createElement('div'); ph.className='image-placeholder'; ph.dataset.label=frame.dataset.label||'IMAGE'; ph.dataset.number=frame.dataset.number||'01'; frame.appendChild(ph); } };
  $$('.image-frame').forEach(frame => { ensurePlaceholder(frame); const image=$('img', frame); if (!image) return; const fail=()=>frame.classList.add('is-missing'); image.addEventListener('error', fail, {once:true}); if (image.complete && image.naturalWidth === 0) fail(); });

  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), {threshold:.14, rootMargin:'0px 0px -8%'});
    $$('.reveal').forEach((el,i) => { el.style.transitionDelay = `${Math.min(i%6,5)*70}ms`; io.observe(el); });
  } else $$('.reveal').forEach(el => el.classList.add('is-visible'));

  const animateCounter = el => { const target=+el.dataset.counter; const suffix=el.dataset.suffix||''; if (el.dataset.done) return; el.dataset.done='1'; if (reduce) {el.textContent=target+suffix; return;} const start=performance.now(), dur=1500; const tick=t=>{ const p=Math.min((t-start)/dur,1); el.textContent=Math.floor(target*(1-Math.pow(1-p,3)))+suffix; if(p<1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  const counters=$$('[data-counter]');
  if ('IntersectionObserver' in window) { const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){animateCounter(e.target);cio.unobserve(e.target)}}),{threshold:.5}); counters.forEach(c=>cio.observe(c)); } else counters.forEach(animateCounter);

  $$('[data-founded]').forEach(box => { const start=new Date(box.dataset.founded+'T00:00:00'); const now=new Date(); let y=now.getFullYear()-start.getFullYear(), m=now.getMonth()-start.getMonth(), d=now.getDate()-start.getDate(); if(d<0){m--; d+=new Date(now.getFullYear(), now.getMonth(), 0).getDate();} if(m<0){y--; m+=12;} $('[data-age-years]',box).textContent=Math.max(0,y); $('[data-age-months]',box).textContent=Math.max(0,m); $('[data-age-days]',box).textContent=Math.max(0,d); });

  $$('.story').forEach(b => b.addEventListener('click', () => b.classList.toggle('is-open')));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t=$(a.hash); if(t){ e.preventDefault(); t.scrollIntoView({behavior:reduce?'auto':'smooth'}); }}));
  $$('a[href$=".html"]').forEach(a => a.addEventListener('click', e => { if (e.metaKey||e.ctrlKey||e.shiftKey||a.target) return; e.preventDefault(); document.body.classList.add('is-leaving'); setTimeout(()=>location.href=a.href, reduce?0:320); }));

  const items=$$('[data-lightbox]'); let idx=0, lastFocus=null;
  if (items.length) { const lb=document.createElement('div'); lb.className='lightbox'; lb.innerHTML='<button class="lightbox-close" aria-label="Закрыть">×</button><button class="lightbox-prev" aria-label="Предыдущее">‹</button><div class="lightbox-stage"></div><button class="lightbox-next" aria-label="Следующее">›</button><p class="lightbox-title"></p>'; document.body.appendChild(lb);
    const stage=$('.lightbox-stage',lb), title=$('.lightbox-title',lb);
    const render=()=>{ const it=items[idx]; stage.innerHTML=`<figure class="image-frame is-missing" data-label="LIGHTBOX" data-number="${String(idx+1).padStart(2,'0')}"><img src="${it.dataset.lightbox}" alt="${it.dataset.title||'Галерея'}"></figure>`; title.textContent=it.dataset.title||''; const frame=$('.image-frame',stage); ensurePlaceholder(frame); const im=$('img',frame); im.onload=()=>frame.classList.remove('is-missing'); im.onerror=()=>frame.classList.add('is-missing'); };
    const open=i=>{idx=i;lastFocus=document.activeElement;render();lb.classList.add('is-open');document.body.classList.add('menu-open');$('.lightbox-close',lb).focus();};
    const close=()=>{lb.classList.remove('is-open');document.body.classList.remove('menu-open');lastFocus?.focus();}; const move=n=>{idx=(idx+n+items.length)%items.length;render();};
    items.forEach((it,i)=>it.addEventListener('click',()=>open(i))); $('.lightbox-close',lb).onclick=close; $('.lightbox-prev',lb).onclick=()=>move(-1); $('.lightbox-next',lb).onclick=()=>move(1); lb.addEventListener('click',e=>{if(e.target===lb)close();});
    addEventListener('keydown',e=>{ if(e.key==='Escape'){closeMenu(); if(lb.classList.contains('is-open')) close();} if(lb.classList.contains('is-open')&&e.key==='ArrowLeft')move(-1); if(lb.classList.contains('is-open')&&e.key==='ArrowRight')move(1); });
  } else addEventListener('keydown',e=>{ if(e.key==='Escape') closeMenu(); });
})();
