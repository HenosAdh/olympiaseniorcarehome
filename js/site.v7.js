/* Olympia Senior Care — shared behaviour for every page (v7, 30 Sep).
   Versioned by filename like the CSS: assets are cached for four hours,
   so a changed file needs a new name, never a ?v= query string. */
(function(){
  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();

  var nav = document.getElementById('nav');
  if(nav){
    var onScroll = function(){ nav.classList.toggle('stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  var t = document.getElementById('menuToggle'), d = document.getElementById('drawer');
  if(t && d){
    t.addEventListener('click', function(){
      var open = d.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    d.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ d.classList.remove('open'); t.setAttribute('aria-expanded','false'); }
    });
  }

  // Services dropdown. Hover and keyboard focus open it in CSS. On a touch
  // screen wide enough to show the desktop nav, the first tap on "Services"
  // opens the list and the second tap follows the link.
  var subs = document.querySelectorAll('.has-sub');
  Array.prototype.forEach.call(subs, function(h){
    var top = h.querySelector('.sub-top');
    if(!top) return;
    top.addEventListener('click', function(e){
      if(window.matchMedia('(hover: none)').matches && !h.classList.contains('open')){
        e.preventDefault(); h.classList.add('open');
      }
    });
  });
  document.addEventListener('click', function(e){
    Array.prototype.forEach.call(subs, function(h){ if(!h.contains(e.target)) h.classList.remove('open'); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      Array.prototype.forEach.call(subs, function(h){
        h.classList.remove('open');
        if(h.contains(document.activeElement)) document.activeElement.blur();
      });
    }
  });

  // Tour form (homepage and contact page). Posts to Web3Forms so the family
  // sees an inline thank-you; the plain form action still works if JavaScript
  // is off. Web3Forms needs no activation click, unlike FormSubmit, which this
  // replaced on 30 Sep after it started returning 500s for every address.
  var f = document.getElementById('tourForm'), ok = document.getElementById('ok');
  if(f && ok){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(!f.checkValidity()){ f.reportValidity(); return; }
      var btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending...';
      var data = {};
      new FormData(f).forEach(function(v, k){ data[k] = v; });
      fetch(f.action, {
        method:'POST',
        headers:{'Content-Type':'application/json', 'Accept':'application/json'},
        body:JSON.stringify(data)
      }).then(function(r){
        if(!r.ok) throw new Error(r.status);
        f.style.display = 'none'; ok.classList.add('show'); ok.scrollIntoView({block:'center'});
      }).catch(function(){
        btn.disabled = false; btn.textContent = 'Request a tour';
        alert('Something went wrong. Please call (360) 968-9752 and we will pick up.');
      });
    });
  }
})();

/* ============================================================
   Analytics (v7, 30 Sep). Same pattern as the other Full Census sites:
   both tags load after the page has loaded so they never slow the first paint.

   GA4      G-442T205S6E   property 556589280, FullCensus account
   Clarity  ypyewdsqq7     masking mode STRICT, set deliberately.
            Families type a parent's dementia details into the tour form, and
            that is health data under Washington's My Health My Data Act.
            Strict masking plus data-clarity-mask on the form keeps every
            keystroke out of the recordings. Do not relax either one.
   ============================================================ */
(function(){
  // Only the real site reports. Staging (fullcensus.org/olympiaseniorcare) and
  // localhost must never write into Peter's property, or the numbers we show him
  // are our own visits.
  var LIVE = /(^|\.)olympiaseniorcarehome\.com$/i.test(location.hostname);
  if(!LIVE) return;
  var GA_ID = 'G-442T205S6E';
  var CLARITY_ID = 'ypyewdsqq7';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  function load(){
    if(GA_ID){
      var g = document.createElement('script'); g.async = true;
      g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(g);
      gtag('js', new Date()); gtag('config', GA_ID);
    }
    // Clarity waits for the first scroll, tap or key. On a phone it is pure
    // weight during load (Lighthouse: 74 KiB unused JS), and a visitor who
    // never interacts is not a session worth recording anyway.
    if(CLARITY_ID){
      var started = false;
      var startClarity = function(){
        if(started) return; started = true;
        ['pointerdown','keydown','scroll','touchstart'].forEach(function(e){
          window.removeEventListener(e, startClarity, {passive:true});
        });
        (function(c,l,a,r,i,t,y){ c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r); t.async=1; t.src='https://www.clarity.ms/tag/'+i;
          y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
        })(window, document, 'clarity', 'script', CLARITY_ID);
      };
      ['pointerdown','keydown','scroll','touchstart'].forEach(function(e){
        window.addEventListener(e, startClarity, {passive:true});
      });
      setTimeout(startClarity, 12000);   // and after 12s regardless, so idle readers still count
    }
  }
  var fire = function(){ ('requestIdleCallback' in window) ? requestIdleCallback(load, {timeout:3000}) : setTimeout(load, 1500); };
  if(document.readyState === 'complete') fire(); else window.addEventListener('load', fire);
})();

function track(name, params){
  params = params || {};
  try{ if(window.gtag) window.gtag('event', name, params); }catch(e){}
  try{ window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({event:name}, params)); }catch(e){}
  try{ if(window.clarity) window.clarity('event', name); }catch(e){}
}

/* what a family actually does: taps the phone, asks for directions, opens the
   tour form, sends it. data-track is already on the links; the section id is
   passed along so the monthly report can say WHERE they tapped. */
(function(){
  var EVT = {call:'call_click', directions:'directions_click', tour:'tour_click'};
  function where(el){
    var s = el.closest('section, header, footer');
    return (s && (s.id || s.className.split(' ')[0])) || 'page';
  }
  document.querySelectorAll('[data-track]').forEach(function(el){
    el.addEventListener('click', function(){
      var t = el.getAttribute('data-track');
      track(EVT[t] || 'cta_click', {location: where(el)});
    });
  });
  document.querySelectorAll('a[href$="#visit"], a[href="contact.html"]').forEach(function(el){
    el.addEventListener('click', function(){ track('tour_click', {location: where(el)}); });
  });
  var tf = document.getElementById('tourForm');
  if(tf) tf.addEventListener('submit', function(){ track('tour_form_submit', {location:'tour_form'}); });
})();
