// ===== MOBILE MENU =====
function toggleMenu(){
  var m=document.getElementById('mobileMenu');
  m.classList.toggle('open');
}
document.addEventListener('click',function(e){
  var m=document.getElementById('mobileMenu');
  if(m.classList.contains('open')&&!e.target.closest('.ham')&&!e.target.closest('.mobile-menu')){
    m.classList.remove('open');
  }
});

// ===== FAQ ACCORDION =====
function toggleFaq(btn){
  var ans=btn.nextElementSibling;
  var icon=btn.querySelector('.faq-icon');
  var isOpen=ans.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach(function(a){a.classList.remove('open');});
  document.querySelectorAll('.faq-icon').forEach(function(i){i.classList.remove('open');});
  if(!isOpen){ans.classList.add('open');icon.classList.add('open');}
}

// ===== ANIMATED COUNTER =====
function animateCounter(el, target){
  var start=0, duration=2000, step=target/100;
  var timer=setInterval(function(){
    start+=step;
    if(start>=target){start=target;clearInterval(timer);}
    if(target>=100000){el.textContent=Math.floor(start/1000)+'K+';}
    else{el.textContent=Math.floor(start)+'+';}
  },20);
}
var observed=false;
var io=new IntersectionObserver(function(entries){
  if(entries[0].isIntersecting&&!observed){
    observed=true;
    var el=document.getElementById('stat1');
    if(el) animateCounter(el,500);
  }
});
var statsEl=document.querySelector('.stats');
if(statsEl) io.observe(statsEl);

// ===== DRAG & DROP =====
['imgDrop'].forEach(function(id){
  var el=document.getElementById(id);
  if(!el)return;
  el.addEventListener('dragover',function(e){e.preventDefault();el.classList.add('drag-over');});
  el.addEventListener('dragleave',function(){el.classList.remove('drag-over');});
  el.addEventListener('drop',function(e){
    e.preventDefault();el.classList.remove('drag-over');
    var dt=e.dataTransfer;
    if(dt&&dt.files.length){
      document.getElementById('upload').files=dt.files;
      document.getElementById('upload').dispatchEvent(new Event('change'));
    }
  });
});

// ===== TABS =====
function showTab(tabId,btn){
  document.querySelectorAll('.tool-section').forEach(function(el){el.style.display='none';});
  document.getElementById(tabId).style.display='block';
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});
  btn.classList.add('on');
  if(tabId==='imgBox'){
    document.getElementById('chips-img').style.display='grid';
    document.getElementById('chips-pdf').style.display='none';
    document.getElementById('moreToolsHd').innerText='More Image Tools';
  }else{
    document.getElementById('chips-img').style.display='none';
    document.getElementById('chips-pdf').style.display='grid';
    document.getElementById('moreToolsHd').innerText='More PDF Tools';
  }
}

// ===== PDF UPLOAD UI =====
document.getElementById('pdfUp').addEventListener('change',function(){
  var dropMain=document.getElementById('pdfDropMain');
  var dropHint=document.getElementById('pdfDropHint');
  var dropIco=document.getElementById('pdfDropIco');
  if(this.files.length>0){
    if(this.files.length===1){
      dropMain.innerHTML='<span style="color:var(--green)">'+this.files[0].name+'</span>';
      var sizeStr=(this.files[0].size/1024).toFixed(1)+' KB';
      if(this.files[0].size>1024*1024) sizeStr=(this.files[0].size/(1024*1024)).toFixed(2)+' MB';
      dropHint.innerText='Selected Size: '+sizeStr;
    }else{
      dropMain.innerHTML='<span style="color:var(--green)">'+this.files.length+' PDFs Selected</span>';
      var totalSize=Array.from(this.files).reduce(function(acc,f){return acc+f.size;},0);
      var sizeStr=(totalSize/1024).toFixed(1)+' KB';
      if(totalSize>1024*1024) sizeStr=(totalSize/(1024*1024)).toFixed(2)+' MB';
      dropHint.innerText='Total Size: '+sizeStr;
    }
    dropIco.innerHTML='✅';
    dropIco.style.background='rgba(62,207,142,.1)';
    dropIco.style.borderColor='rgba(62,207,142,.3)';
  }else{
    dropMain.innerHTML='Drop PDFs here or <span>browse</span>';
    dropHint.innerText='Select one or multiple PDF files';
    dropIco.innerHTML='📄';
    dropIco.style.background='rgba(109,84,240,.12)';
    dropIco.style.borderColor='rgba(109,84,240,.2)';
  }
});

// ===== ASPECT RATIO LOCK =====
var aspectLocked=false;
var origRatio=1;
var svgUnlocked='<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
var svgLocked='<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';

function toggleLock(){
  aspectLocked=!aspectLocked;
  var btn=document.getElementById('lockBtn');
  var svg=document.getElementById('lockSvg');
  if(aspectLocked){
    svg.innerHTML=svgLocked;
    btn.style.color='var(--purple-l)';btn.style.background='rgba(109,84,240,.15)';btn.style.borderColor='rgba(109,84,240,.4)';
  }else{
    svg.innerHTML=svgUnlocked;
    btn.style.color='var(--muted)';btn.style.background='rgba(255,255,255,.04)';btn.style.borderColor='rgba(255,255,255,.1)';
  }
}

document.getElementById('upload').addEventListener('change',function(){
  var prev=document.getElementById('prev');
  prev.innerHTML='';
  if(!this.files.length){prev.style.display='none';return;}
  prev.style.display='grid';
  for(var i=0;i<this.files.length;i++){
    var f=this.files[i];
    if(!f.type.startsWith('image/'))continue;
    var img=document.createElement('img');
    img.src=URL.createObjectURL(f);
    img.style.cssText='width:100%;height:100%;object-fit:cover';
    var d=document.createElement('div');d.className='prev-item';d.appendChild(img);
    prev.appendChild(d);
  }
  var firstFile=this.files[0];
  if(firstFile.type.startsWith('image/')){
    var tempImg=new Image();
    tempImg.onload=function(){
      origRatio=tempImg.width/tempImg.height;
      document.getElementById('resW').value=tempImg.width;
      document.getElementById('resH').value=tempImg.height;
      URL.revokeObjectURL(this.src);
    };
    tempImg.src=URL.createObjectURL(firstFile);
  }
});

document.getElementById('resW').addEventListener('input',function(){
  if(aspectLocked&&this.value){document.getElementById('resH').value=Math.round(this.value/origRatio);}
});
document.getElementById('resH').addEventListener('input',function(){
  if(aspectLocked&&this.value){document.getElementById('resW').value=Math.round(this.value*origRatio);}
});

function qSet(v,btn){
  document.getElementById('size').value=v;
  document.querySelectorAll('.qb').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
}

// ===== MASTER IMAGE COMPRESS / UPSIZE =====
async function startMaster(){
  var fi=document.getElementById('upload'),si=document.getElementById('size'),un=document.getElementById('unit');
  var wInp=document.getElementById('resW').value,hInp=document.getElementById('resH').value;
  var st=document.getElementById('status');
  document.getElementById('rg').innerHTML='';
  if(!fi.files.length){alert('Please select an image first.');return;}
  var tk=parseFloat(si.value);
  if(tk&&un.value==='mb') tk*=1024;
  
  var w=parseInt(wInp),h=parseInt(hInp);
  if(!tk&&(!w||!h)){alert('Please enter a Target Size (KB) OR both Width and Height to proceed.');return;}
  var files=fi.files,pw=document.getElementById('pbox'),pb=document.getElementById('pfill');
  pw.style.display='block';
  for(var i=0;i<files.length;i++){
    pb.style.width=((i+1)/files.length*100)+'%';
    st.innerText='Processing Image '+(i+1)+' / '+files.length+'…';
    var blob=await processMasterImg(files[i],tk,w,h);
    if(!blob)continue;
    var dlName=files[i].name.replace(/\.[^/.]+$/,'')+'-processed.jpg';
    addResult(blob,i,false,dlName);
    if(files.length===1) setDl(blob,dlName,st,files[0].size/1024);
  }
  st.innerText='Done ✅';pb.style.width='100%';
  setTimeout(function(){pw.style.display='none';},1500);
}

async function processMasterImg(file,tkb,targetW,targetH){
  var img=new Image();img.src=URL.createObjectURL(file);await img.decode();
  var finalW=targetW||img.width;var finalH=targetH||img.height;
  var cv=document.createElement('canvas'),ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';

  if(!tkb){
    cv.width=finalW;cv.height=finalH;
    ctx.drawImage(img,0,0,finalW,finalH);
    return new Promise(function(r){cv.toBlob(r,'image/jpeg',0.95);});
  }

  // Quick test to see natural size at highest quality
  cv.width=finalW;cv.height=finalH;
  ctx.drawImage(img,0,0,cv.width,cv.height);
  var maxBlob=await new Promise(function(r){cv.toBlob(r,'image/jpeg',1.0);});

  var scale=1, best=null;

  // 1. IF NEED TO INCREASE SIZE
  if(maxBlob.size/1024 < tkb) {
     // Scale up dimensions to generate more pixel data
     scale = Math.sqrt(tkb / (maxBlob.size/1024)) * 1.2; 
     var MAX_DIM = 8000; // Cap to prevent crashing browser
     if(finalW*scale > MAX_DIM) scale = MAX_DIM/finalW;
     if(finalH*scale > MAX_DIM) scale = MAX_DIM/finalH;

     cv.width=Math.round(finalW*scale);
     cv.height=Math.round(finalH*scale);
     ctx.drawImage(img,0,0,cv.width,cv.height);

     var lo=0.5,hi=1.0; 
     for(var i=0;i<20;i++){
       var q=(lo+hi)/2;
       var b=await new Promise(function(r){cv.toBlob(r,'image/jpeg',q);});
       if(!b)continue;
       if(b.size/1024 > tkb) hi=q; else{lo=q;best=b;}
     }
     return best || await new Promise(function(r){cv.toBlob(r,'image/jpeg',1.0);});
  }

  // 2. IF NEED TO DECREASE SIZE
  for(var s=0;s<10;s++){
    cv.width=Math.round(finalW*scale);
    cv.height=Math.round(finalH*scale);
    ctx.drawImage(img,0,0,cv.width,cv.height);
    var lo=0.05,hi=0.95;
    for(var i=0;i<20;i++){
      var q=(lo+hi)/2;
      var b=await new Promise(function(r){cv.toBlob(r,'image/jpeg',q);});
      if(!b)continue;
      if(b.size/1024>tkb) hi=q; else{lo=q;best=b;}
    }
    if(best&&best.size/1024<=tkb)break;
    scale*=0.85;
  }
  return best;
}

// ===== PDF COMPRESSOR =====
async function compressPDF(){
  var fi=document.getElementById('pdfUp'),si=document.getElementById('pdfSz'),st=document.getElementById('status');
  if(!fi.files.length){alert('Please select a PDF first.');return;}
  var tk=parseFloat(si.value);
  if(!tk||tk<=0){alert('Enter valid size');return;}

  var files=fi.files,pw=document.getElementById('pbox'),pb=document.getElementById('pfill');
  pw.style.display='block';
  document.getElementById('rg').innerHTML='';
  for(var fIdx=0;fIdx<files.length;fIdx++){
    pb.style.width=((fIdx)/files.length*100)+'%';
    st.innerText='Processing PDF '+(fIdx+1)+' / '+files.length+'…';
    var file=files[fIdx];
    var ab=await file.arrayBuffer();
    var pdf=await pdfjsLib.getDocument({data:ab}).promise;
    var jspdf=window.jspdf;
    var q=.8,scale=1,out=null;
    for(var a=0;a<20;a++){
      var np=new jspdf.jsPDF();
      for(var pg_i=1;pg_i<=pdf.numPages;pg_i++){
        var pg=await pdf.getPage(pg_i),vp=pg.getViewport({scale:scale}),
            cv=document.getElementById('pdfCv'),ctx=cv.getContext('2d');
        cv.width=vp.width;cv.height=vp.height;
        await pg.render({canvasContext:ctx,viewport:vp}).promise;
        var id=cv.toDataURL('image/jpeg',q);
        if(pg_i>1) np.addPage();
        np.addImage(id,'JPEG',0,0,np.internal.pageSize.getWidth(),np.internal.pageSize.getHeight());
      }
      out=np.output('blob');
      if(out.size/1024<=tk)break;
      q-=.08;scale-=.08;
      if(q<.3)q=.3;if(scale<.4)scale=.4;
    }
    var dlName=file.name.replace(/\.[^/.]+$/,'')+'-compressed.pdf';
    addResult(out,fIdx,true,dlName);
    if(files.length===1) setDl(out,dlName,st,file.size/1024);
    pb.style.width=((fIdx+1)/files.length*100)+'%';
  }
  st.innerText='All PDFs Processed ✅';pb.style.width='100%';
  setTimeout(function(){pw.style.display='none';},1500);
}

// ===== UTILS =====
function setDl(blob,name,st,origKB){
  var compKB=blob.size/1024;
  showCompressAnim(origKB||compKB*2,compKB,blob,name||'processed.jpg');
  if(st)st.innerText='';
}
function dlUrl(url,name){var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);}
function addResult(blob,i,isPdf,downloadName){
  var url=URL.createObjectURL(blob);
  var d=document.createElement('div');d.className='rc';
  var previewHtml=isPdf?'<div class="rc-pdf-icon" title="PDF">📄</div>':'<img src="'+url+'" loading="lazy" onclick="openPM(\''+url+'\')">';
  var dlName=downloadName||(isPdf?'processed_'+(i+1)+'.pdf':'processed_'+(i+1)+'.jpg');
  d.innerHTML=previewHtml+'<div class="ri"><div class="rsz" title="'+dlName+'">'+(blob.size/1024).toFixed(1)+' KB</div><button class="rb" onclick="dlUrl(\''+url+'\',\''+dlName+'\')">⬇ Download</button></div>';
  document.getElementById('rg').appendChild(d);
}
function openPM(src){document.getElementById('pm').style.display='flex';document.getElementById('pmi').src=src;}

// ===== COMPRESSION ANIMATION =====
(function(){
  var animBlob=null,animRunning=false;
  function ez(t){return t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1}
  function lerp(a,b,t){return a+(b-a)*t}
  function anim(dur,fn,done){var s=performance.now();(function f(n){var t=Math.min((n-s)/dur,1);fn(ez(t),t);if(t<1)requestAnimationFrame(f);else if(done)done();})(s);}
  function wave(el,delay){
    setTimeout(function(){
      el.style.transition='none';el.style.opacity='.8';el.style.transform='translate(-50%,-50%) scale(0)';
      requestAnimationFrame(function(){el.style.transition='all .6s ease-out';el.style.transform='translate(-50%,-50%) scale(4)';el.style.opacity='0';});
    },delay);
  }
  window.showCompressAnim=function(origKB,compKB,blob,fname){
    if(animRunning)return;animRunning=true;animBlob={blob:blob,name:fname};
    var origStr=origKB>1024?(origKB/1024).toFixed(1)+' MB':origKB.toFixed(0)+' KB';
    var compStr=compKB.toFixed(1)+' KB';
    document.getElementById('origLabel').textContent=origStr;
    document.getElementById('sbVal').textContent=compStr;
    document.getElementById('asBefore').textContent=origStr;
    document.getElementById('asAfter').textContent=compStr;
    
    // Check if increased or decreased to set correct message
    if (compKB < origKB) {
        var pct = Math.max(0,Math.round((1-compKB/origKB)*100));
        document.getElementById('amsg').textContent = pct > 0 ? pct + '% size reduced! 🎉' : 'File processed successfully! ✅';
    } else {
        var pctInc = Math.max(0,Math.round((compKB/origKB - 1)*100));
        document.getElementById('amsg').textContent = pctInc + '% size increased! 🚀';
    }

    var dlBtn=document.getElementById('adlBtn');
    dlBtn.textContent='⬇ Download ('+compStr+')';
    dlBtn.style.opacity='0';dlBtn.style.transform='translateY(10px)';
    dlBtn.onclick=function(){if(animBlob){var a=document.createElement('a');a.href=URL.createObjectURL(animBlob.blob);a.download=animBlob.name;a.click();}closeAnim();};
    var bb=document.getElementById('bigBlob'),sb=document.getElementById('smallBlob');
    var hL=document.getElementById('handL'),hR=document.getElementById('handR');
    var stats=document.getElementById('astats'),amsg=document.getElementById('amsg');
    bb.style.cssText='position:absolute;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#8b6dff,#4a35cc);box-shadow:0 0 40px rgba(109,84,240,.5);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;z-index:2;opacity:1;';
    sb.style.cssText='position:absolute;width:0;height:0;border-radius:50%;background:radial-gradient(circle at 40% 35%,#3ecf8e,#16a35a);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;z-index:3;opacity:0;';
    document.getElementById('sbLbl').style.opacity=0;document.getElementById('sbVal').style.opacity=0;
    hL.style.cssText='position:absolute;top:50%;transform:translateY(-50%);font-size:32px;opacity:0;z-index:4;left:0;';
    hR.style.cssText='position:absolute;top:50%;transform:translateY(-50%) scaleX(-1);font-size:32px;opacity:0;z-index:4;right:0;';
    stats.style.opacity='0';stats.style.transform='translateY(12px)';amsg.style.opacity='0';
    var ov=document.getElementById('ov');ov.style.opacity='1';ov.style.pointerEvents='all';
    setTimeout(function(){hL.style.opacity='1';hR.style.opacity='1';},300);
    setTimeout(function(){
      var prog=0;
      var iv=setInterval(function(){
        prog+=0.04;if(prog>=1){prog=1;clearInterval(iv);}
        var e=ez(prog);var hp=lerp(0,18,e);hL.style.left=hp+'px';hR.style.right=hp+'px';
        var mid=Math.sin(prog*Math.PI);
        var bw=lerp(120,60,e)+mid*20;var bh=lerp(120,60,e)+mid*20;
        bb.style.width=bw+'px';bb.style.height=bh+'px';bb.style.opacity=lerp(1,0,e*e);
      },16);
    },800);
    setTimeout(function(){
      bb.style.opacity='0';
      wave(document.getElementById('w1'),0);wave(document.getElementById('w2'),150);wave(document.getElementById('w3'),300);
      hL.style.left='-20px';hR.style.right='-20px';hL.style.opacity='0';hR.style.opacity='0';
    },1600);
    setTimeout(function(){
      anim(600,function(t){
        var sz=lerp(0,64,t);sb.style.width=sz+'px';sb.style.height=sz+'px';sb.style.opacity=t;
        sb.style.boxShadow='0 0 '+lerp(0,30,t)+'px rgba(62,207,142,'+lerp(0,.6,t)+')';
      },function(){document.getElementById('sbLbl').style.opacity=1;document.getElementById('sbVal').style.opacity=1;});
    },1800);
    setTimeout(function(){stats.style.opacity='1';stats.style.transform='translateY(0)';},2500);
    setTimeout(function(){amsg.style.opacity='1';},3000);
    setTimeout(function(){dlBtn.style.opacity='1';dlBtn.style.transform='translateY(0)';animRunning=false;},3200);
  };
  window.closeAnim=function(){document.getElementById('ov').style.opacity='0';document.getElementById('ov').style.pointerEvents='none';animRunning=false;};
})();

// ===== ADSENSE INIT =====
(adsbygoogle=window.adsbygoogle||[]).push({});
(adsbygoogle=window.adsbygoogle||[]).push({});
