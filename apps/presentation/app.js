const deck = document.querySelector('#deck');
const toc = document.querySelector('#toc');
const notes = document.querySelector('#notes');
let current = 0;
deck.innerHTML = slides.map((s,i)=>`<section class="slide ${s.className || ''}" id="slide-${i+1}" aria-labelledby="title-${i+1}" ${i?'hidden':''}><p class="kicker"><span>${s.section}</span><span class="folio">APPLIED AI / ${String(i+1).padStart(2,'0')}</span></p><${i?'h2':'h1'} id="title-${i+1}">${s.title}</${i?'h2':'h1'}><p class="lead">${s.lead}</p><div class="body">${s.body}</div></section>`).join('');
toc.innerHTML = '<strong>Presentation contents</strong>' + slides.map((s,i)=>`<a href="#${i+1}">${String(i+1).padStart(2,'0')} / ${s.title.replace(/<[^>]*>/g,' ')}</a>`).join('');
const sections = [...deck.children];
function show(index, updateHash = true) {
 current = Math.max(0, Math.min(slides.length - 1, index));
 sections.forEach((s,i)=>{s.hidden=i!==current;});
 document.querySelector('#counter').textContent = `${String(current+1).padStart(2,'0')} / ${slides.length}`;
 document.querySelector('#section-name').textContent=slides[current].section;
 document.querySelector('#progress-fill').style.width=`${(current+1)/slides.length*100}%`;
 document.querySelector('#prev').disabled=current===0;
 document.querySelector('#next').disabled=current===slides.length-1;
 notes.textContent=slides[current].notes;
 toc.querySelectorAll('a').forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(updateHash)history.replaceState(null,'',`#${current+1}`);
 document.title=`${current+1}. ${slides[current].title.replace(/<[^>]*>/g,' ')} | Applied AI delivery`;
 window.scrollTo(0,0);
}
function fromHash(){const value=Number(location.hash.slice(1));show(Number.isInteger(value)&&value>0?value-1:0,false);}
function toggleNotes(){notes.hidden=!notes.hidden;document.querySelector('#notes-toggle').setAttribute('aria-pressed',String(!notes.hidden));}
function toggleContents(force){toc.hidden=typeof force==='boolean'?!force:!toc.hidden;document.querySelector('#contents').setAttribute('aria-expanded',String(!toc.hidden));if(!toc.hidden)toc.querySelector('[aria-current]').focus();}
document.querySelector('#prev').addEventListener('click',()=>show(current-1));
document.querySelector('#next').addEventListener('click',()=>show(current+1));
document.querySelector('#notes-toggle').addEventListener('click',toggleNotes);
document.querySelector('#contents').addEventListener('click',()=>toggleContents());
document.querySelector('#print').addEventListener('click',()=>window.print());
document.querySelector('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#fullscreen').textContent='Use browser full screen';}});
document.addEventListener('fullscreenchange',()=>{document.querySelector('#fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
toc.addEventListener('click',event=>{if(event.target.closest('a')){toggleContents(false);document.querySelector('#contents').focus();}});
window.addEventListener('hashchange',fromHash);
document.addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.target.isContentEditable)return;
 if(event.key==='Escape'){toggleContents(false);if(!notes.hidden)toggleNotes();return;}
 if(event.key.toLowerCase()==='n'){toggleNotes();return;}
 if(event.key.toLowerCase()==='c'){toggleContents();return;}
 if(!toc.hidden)return;
 if(['ArrowRight','PageDown'].includes(event.key)){event.preventDefault();show(current+1);}
 if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();show(current-1);}
 if(event.key==='Home'){event.preventDefault();show(0);}
 if(event.key==='End'){event.preventDefault();show(slides.length-1);}
});
fromHash();
