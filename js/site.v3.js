/* Olympia Senior Care — shared behaviour for every page (v3, 15 Sep).
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

  // Tour form (homepage and contact page). Posts to FormSubmit's AJAX
  // endpoint so the family sees an inline thank-you; the plain form action
  // still works if JavaScript is off. FormSubmit only delivers after Peter
  // clicks its one-time activation email.
  var f = document.getElementById('tourForm'), ok = document.getElementById('ok');
  if(f && ok){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(!f.checkValidity()){ f.reportValidity(); return; }
      var btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending...';
      var data = {};
      new FormData(f).forEach(function(v, k){ data[k] = v; });
      fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method:'POST',
        headers:{'Content-Type':'application/json', 'Accept':'application/json'},
        body:JSON.stringify(data)
      }).then(function(r){
        if(!r.ok) throw new Error(r.status);
        f.style.display = 'none'; ok.classList.add('show'); ok.scrollIntoView({block:'center'});
      }).catch(function(){
        btn.disabled = false; btn.textContent = 'Request a tour';
        alert('Something went wrong. Please call (425) 589-1971 and we will pick up.');
      });
    });
  }
})();
