/* =========================================
   REDUCE SIZE — PREMIUM JAVASCRIPT
   Image Compressor (Exact KB) & PDF Tools
   ========================================= */

// 1. 📱 MOBILE MENU TOGGLE
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        menu.style.display = 'none';
    } else {
        menu.classList.add('open');
        menu.style.display = 'flex';
    }
}

// 2. 🗂️ TAB SWITCHING (Image vs PDF)
function showTab(tabId, btn) {
    document.querySelectorAll('.tool-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    
    document.getElementById(tabId).style.display = 'block';
    btn.classList.add('on');
}

// 3. 🎯 QUICK TARGET BUTTONS
function qSet(val, btn) {
    document.getElementById('size').value = val;
    document.getElementById('unit').value = 'kb';
    
    document.querySelectorAll('.qb').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
}

// 4. 🔒 ASPECT RATIO LOCK LOGIC
let aspectLock = true;
let origRatio = 1;

function toggleLock() {
    aspectLock = !aspectLock;
    const svg = document.getElementById('lockSvg');
    if(aspectLock) {
        svg.style.color = 'var(--text)';
        svg.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
    } else {
        svg.style.color = 'var(--muted)';
        svg.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 0 9.9-1"></path>';
    }
}

// 5. 📂 DRAG & DROP AND FILE PREVIEW
const imgInput = document.getElementById('upload');
const imgDrop = document.getElementById('imgDrop');
const prevGrid = document.getElementById('prev');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    imgDrop.addEventListener(eventName, preventDefaults, false);
});
function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

['dragenter', 'dragover'].forEach(eventName => {
    imgDrop.addEventListener(eventName, () => imgDrop.classList.add('drag-over'), false);
});
['dragleave', 'drop'].forEach(eventName => {
    imgDrop.addEventListener(eventName, () => imgDrop.classList.remove('drag-over'), false);
});

imgDrop.addEventListener('drop', (e) => {
    imgInput.files = e.dataTransfer.files;
    handleImageFiles(imgInput.files);
});
imgInput.addEventListener('change', function() {
    handleImageFiles(this.files);
});

function handleImageFiles(files) {
    if(files.length === 0) return;
    prevGrid.style.display = 'grid';
    prevGrid.innerHTML = '';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            origRatio = img.width / img.height;
            document.getElementById('resW').value = img.width;
            document.getElementById('resH').value = img.height;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(files[0]);

    Array.from(files).slice(0, 10).forEach(file => {
        const url = URL.createObjectURL(file);
        prevGrid.innerHTML += `<div class="prev-item"><img src="${url}" alt="preview"></div>`;
    });
}

document.getElementById('resW').addEventListener('input', function() {
    if(aspectLock && this.value) document.getElementById('resH').value = Math.round(this.value / origRatio);
});
document.getElementById('resH').addEventListener('input', function() {
    if(aspectLock && this.value) document.getElementById('resW').value = Math.round(this.value * origRatio);
});

// 6. ⚡ IMAGE COMPRESSION ENGINE
async function startMaster() {
    const files = imgInput.files;
    if(files.length === 0) return alert("Please select an image first!");

    const targetVal = parseFloat(document.getElementById('size').value);
    const unit = document.getElementById('unit').value;
    let targetBytes = targetVal ? (unit === 'mb' ? targetVal * 1024 * 1024 : targetVal * 1024) : null;
    
    const resW = parseInt(document.getElementById('resW').value);
    const resH = parseInt(document.getElementById('resH').value);

    showProgress("Compressing Images...");
    const rg = document.getElementById('rg');
    rg.innerHTML = ''; 

    for(let i=0; i<files.length; i++) {
        let file = files[i];
        updateProgress(((i)/files.length)*100);
        
        let compressedFile = await processImage(file, targetBytes, resW, resH);
        
        const url = URL.createObjectURL(compressedFile);
        const beforeKB = (file.size / 1024).toFixed(2);
        const afterKB = (compressedFile.size / 1024).toFixed(2);
        
        rg.innerHTML += `
        <div class="rc">
            <img src="${url}" onclick="openPreview('${url}')">
            <div class="ri">
                <div style="font-size:11px; color:var(--muted); text-decoration:line-through;">${beforeKB} KB</div>
                <div class="rsz">${afterKB} KB</div>
                <button class="rb" onclick="downloadFile('${url}', 'reduced_${file.name}')">⬇ Download</button>
            </div>
        </div>`;
    }
    updateProgress(100);
    setTimeout(() => hideProgress(), 800);
}

function processImage(file, targetBytes, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width || img.width;
            canvas.height = height || img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if(!targetBytes) {
                canvas.toBlob(blob => resolve(new File([blob], file.name, {type: 'image/jpeg'})), 'image/jpeg', 0.85);
                return;
            }

            let minQ = 0.01, maxQ = 1.0, quality = 0.8;
            let bestBlob = null;
            let iterations = 0;

            const compressLoop = () => {
                canvas.toBlob(blob => {
                    iterations++;
                    if(blob.size <= targetBytes && blob.size > (bestBlob ? bestBlob.size : 0)) {
                        bestBlob = blob; 
                    }

                    if(iterations < 8) { 
                        if(blob.size > targetBytes) maxQ = quality;
                        else minQ = quality;
                        quality = (minQ + maxQ) / 2;
                        compressLoop();
                    } else {
                        resolve(new File([bestBlob || blob], file.name, {type: 'image/jpeg'}));
                    }
                }, 'image/jpeg', quality);
            };
            compressLoop();
        };
    });
}

// 7. 📄 PDF COMPRESSION ENGINE
const pdfInput = document.getElementById('pdfUp');
async function compressPDF() {
    if (!pdfInput.files.length) return alert("Select a PDF file!");
    const targetKB = document.getElementById('pdfSz').value;
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    showProgress("Compressing PDF... This may take a moment.");
    const rg = document.getElementById('rg');
    rg.innerHTML = '';

    for(let file of pdfInput.files) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
            const newPdf = new jspdf.jsPDF();
            newPdf.deletePage(1); 

            let quality = targetKB ? 0.4 : 0.7; 

            for(let i=1; i<=pdf.numPages; i++) {
                updateProgress((i/pdf.numPages)*100);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({scale: 1.5}); 
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({canvasContext: ctx, viewport: viewport}).promise;
                
                const imgData = canvas.toDataURL('image/jpeg', quality);
                newPdf.addPage([viewport.width, viewport.height]);
                newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
            }
            
            const pdfBlob = newPdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            
            const beforeKB = (file.size / 1024).toFixed(2);
            const afterKB = (pdfBlob.size / 1024).toFixed(2);

            rg.innerHTML += `
            <div class="rc">
                <div class="rc-pdf-icon">📄</div>
                <div class="ri">
                    <div style="font-size:11px; color:var(--muted); text-decoration:line-through;">${beforeKB} KB</div>
                    <div class="rsz">${afterKB} KB</div>
                    <button class="rb" onclick="downloadFile('${url}', 'compressed_${file.name}')">⬇ Download PDF</button>
                </div>
            </div>`;
            
        } catch(e) {
            console.error(e);
            alert("Error compressing PDF. Make sure it is not password protected.");
        }
    }
    hideProgress();
}

// 8. 🛠️ HELPER FUNCTIONS
function showProgress(text) {
    document.getElementById('pbox').style.display = 'block';
    document.getElementById('status').innerText = text;
    document.getElementById('pfill').style.width = '0%';
}

function updateProgress(percent) {
    document.getElementById('pfill').style.width = percent + '%';
}

function hideProgress() {
    setTimeout(() => { document.getElementById('pbox').style.display = 'none'; }, 1000);
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openPreview(url) {
    const pm = document.getElementById('pm');
    const pmi = document.getElementById('pmi');
    pmi.src = url;
    pm.style.display = 'flex';
}

function closeAnim() {
    const ov = document.getElementById('ov');
    ov.style.opacity = '0';
    setTimeout(() => { ov.style.pointerEvents = 'none'; }, 300);
}
