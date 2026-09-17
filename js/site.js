/* Olympia Senior Care — shared behaviour for the interior pages.
   The homepage carries its own inline copy of this plus the tour form handler. */
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
})();
