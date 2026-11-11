const pages={cover:document.getElementById('cover'),page2:document.getElementById('page2'),page3:document.getElementById('page3'),player:document.getElementById('player'),last:document.getElementById('lastPage')};
const audio=new Audio();audio.preload='auto';
let track=0,raf=0,turning=false,panelTimer=null,cueTimers=[],scrubbing=false,resumeAfterScrub=false;
const authors=['Віра Коваль','Віктор Герасименко','Лілія Остапенко','Ніна Івашкевіч','Віктор Герасименко','Лілія Остапенко','Людмила Плевако','Віктор Герасименко','Віктор Герасименко','Валентин Любченко','Василь Іваніцький','Віктор Герасименко'];
const $=id=>document.getElementById(id);
function pageTurn(fromId,toId,direction='forward'){
 if(turning)return false;const from=pages[fromId],to=pages[toId];if(!from||!to||fromId===toId)return false;turning=true;to.classList.add('active');from.classList.add('active');
 const sheet=from.cloneNode(true);sheet.id='pageTurnSheet';sheet.className='turn-sheet';sheet.style.opacity='1';$('app').appendChild(sheet);from.classList.remove('active');void sheet.offsetWidth;
 requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add(direction==='backward'?'backward':'forward')));
 setTimeout(()=>{sheet.remove();Object.values(pages).forEach(p=>{if(p!==to)p.classList.remove('active','turn-under')});to.classList.add('active');turning=false},1150);return true;
}
function sec(v){if(Number.isFinite(v))return v;const p=String(v||'0:00').split(':').map(Number);return (p[0]||0)*60+(p[1]||0)}
function fmt(v){v=Math.max(0,Math.floor(v||0));return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function totalDuration(){return audio.duration&&Number.isFinite(audio.duration)?audio.duration:sec(DATA.songs[track][1])}
function updateTimes(){const t=audio.currentTime||0;$('currentPlaying').textContent=fmt(t);$('totalPlaying').textContent=fmt(totalDuration())}
function updateTimeline(){const total=totalDuration(),now=audio.currentTime||0,p=total?Math.max(0,Math.min(100,now/total*100)):0;$('dynamicProgress').style.width=p+'%';$('dynamicKnob').style.left=p+'%'}
function animate(){updateTimes();updateTimeline();if(!audio.paused&&!audio.ended)raf=requestAnimationFrame(animate)}
function startAnimation(){cancelAnimationFrame(raf);raf=requestAnimationFrame(animate)}
function clearCues(){cueTimers.forEach(clearTimeout);cueTimers=[];$('trackTitleCue').classList.remove('visible');$('authorCue').classList.remove('visible')}
function runCues(){clearCues();const title=$('trackTitleCue'),author=$('authorCue');title.textContent=DATA.songs[track][0];$('authorName').textContent=authors[track]||'';cueTimers.push(setTimeout(()=>title.classList.add('visible'),3000));cueTimers.push(setTimeout(()=>title.classList.remove('visible'),5000));cueTimers.push(setTimeout(()=>author.classList.add('visible'),5350));cueTimers.push(setTimeout(()=>author.classList.remove('visible'),9350))}
function setPlayIcon(paused){$('playIcon').innerHTML=paused?'<path d="M16 9L38 24L16 39Z"/>':'<path d="M16 10v28M32 10v28"/>';$('playHit').setAttribute('aria-label',paused?'Відтворення':'Пауза')}
function showPanel(){const panel=$('controlPanel');panel.classList.add('visible');clearTimeout(panelTimer);if(!audio.paused){panelTimer=setTimeout(()=>panel.classList.remove('visible'),2000)}}
function hidePanel(){clearTimeout(panelTimer);$('controlPanel').classList.remove('visible')}
function showScrubTime(){const b=$('seekBubble');b.textContent=fmt(audio.currentTime);const pct=totalDuration()?audio.currentTime/totalDuration():0;b.style.left=(pct*100)+'%';b.classList.add('visible');$('playerDim').classList.add('visible')}
function hideScrubTime(){ $('seekBubble').classList.remove('visible');$('playerDim').classList.remove('visible') }
function resetForTrack(i){audio.pause();cancelAnimationFrame(raf);track=(i+DATA.songs.length)%DATA.songs.length;clearCues();$('playerBg').src=DATA.images[DATA.songs[track][0]];$('panelTrackName').textContent=DATA.songs[track][0];audio.src=DATA.audios[DATA.songs[track][0]];audio.load();$('dynamicProgress').style.width='0%';$('dynamicKnob').style.left='0%';audio.currentTime=0;updateTimes();updateTimeline();setPlayIcon(false);runCues()}
async function playCurrent(){try{await audio.play();setPlayIcon(false);startAnimation();return true}catch(e){setPlayIcon(true);return false}}
async function selectTrack(i){if(turning)return;resetForTrack(i);hidePanel();if(!pageTurn('page3','player','forward'))return;await playCurrent()}
async function changeTrack(delta){
 if(turning)return;
 turning=true;
 const next=(track+delta+DATA.songs.length)%DATA.songs.length;
 hidePanel();
 const sheet=pages.player.cloneNode(true);
 sheet.id='trackTurnSheet';sheet.className='turn-sheet';
 $('app').appendChild(sheet);void sheet.offsetWidth;
 resetForTrack(next);
 await playCurrent();
 requestAnimationFrame(()=>requestAnimationFrame(()=>sheet.classList.add(delta>0?'forward':'backward')));
 setTimeout(()=>{sheet.remove();turning=false},1150);
}
async function playToggle(){if(audio.paused){await playCurrent();showPanel()}else{audio.pause();cancelAnimationFrame(raf);setPlayIcon(true);showPanel()}}
function seekTo(clientX){const r=$('dynamicTimeline').getBoundingClientRect();const x=Math.max(0,Math.min(r.width,clientX-r.left));audio.currentTime=(x/Math.max(1,r.width))*totalDuration();updateTimes();updateTimeline();showScrubTime()}
// Song-button hit areas retain the original V54 coordinates.
DATA.centers.forEach((c,i)=>{const b=document.createElement('button');b.className='songHit';b.style.left=(c[0]/941*100)+'%';b.style.top=(c[1]/1672*100)+'%';b.setAttribute('aria-label','Пісня '+(i+1));b.onclick=e=>{e.stopPropagation();selectTrack(i)};$('songHits').appendChild(b)});
async function cinemaFadeToPage2(){if(turning||!pages.cover.classList.contains('active'))return;turning=true;pages.page2.classList.add('active');pages.page2.style.transition='none';pages.page2.style.opacity='0';void pages.page2.offsetWidth;requestAnimationFrame(()=>{pages.page2.style.transition='opacity 1s ease-in-out';pages.page2.style.opacity='1'});setTimeout(()=>{pages.cover.classList.remove('active');pages.page2.style.opacity='';pages.page2.style.transition='';turning=false},1040)}
const coverAutoTimer=setTimeout(cinemaFadeToPage2,3000);
$('coverArrow').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearTimeout(coverAutoTimer);cinemaFadeToPage2()});
$('page2NextHit').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!turning)pageTurn('page2','page3','forward')});$('page3BackHit').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(!turning)pageTurn('page3','page2','backward')});
$('prevHit').onclick=e=>{e.stopPropagation();changeTrack(-1)};$('nextHit').onclick=e=>{e.stopPropagation();changeTrack(1)};$('playHit').onclick=e=>{e.stopPropagation();playToggle()};
$('controlPanel').addEventListener('click',e=>e.stopPropagation());
pages.player.addEventListener('click',e=>{if(!pages.player.classList.contains('active'))return;if(e.target.closest&&e.target.closest('#controlPanel'))return;showPanel()});
$('homeHit').addEventListener('click',e=>{e.stopPropagation();audio.pause();cancelAnimationFrame(raf);hidePanel();hideScrubTime();pageTurn('player','page3','backward')});
const timeline=$('dynamicTimeline');
timeline.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;scrubbing=true;resumeAfterScrub=!audio.paused;clearTimeout(panelTimer);$('controlPanel').classList.add('visible');audio.pause();timeline.setPointerCapture?.(e.pointerId);seekTo(e.clientX);e.preventDefault()});
timeline.addEventListener('pointermove',e=>{if(scrubbing){seekTo(e.clientX);e.preventDefault()}});
function finishScrub(e){if(!scrubbing)return;if(e.type==='pointerup')seekTo(e.clientX);scrubbing=false;if(timeline.hasPointerCapture?.(e.pointerId))timeline.releasePointerCapture(e.pointerId);hideScrubTime();if(resumeAfterScrub){audio.play().then(()=>{setPlayIcon(false);startAnimation();showPanel()}).catch(()=>{})}else setPlayIcon(true);e.preventDefault()}
timeline.addEventListener('pointerup',finishScrub);timeline.addEventListener('pointercancel',finishScrub);
// Tap anywhere outside the visible controls reveals the panel without pausing audio.
// If the user does nothing, it auto-hides after 2 seconds. While paused it stays available.
audio.addEventListener('timeupdate',()=>{updateTimes();updateTimeline()});audio.addEventListener('loadedmetadata',()=>{updateTimes();updateTimeline()});
audio.addEventListener('play',()=>setPlayIcon(false));audio.addEventListener('pause',()=>setPlayIcon(true));
audio.addEventListener('ended',()=>{changeTrack(1)});
