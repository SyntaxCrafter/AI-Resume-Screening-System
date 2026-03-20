document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const loader = document.querySelector('.loader');
    const btnText = document.querySelector('.btn-text');
    const resultsSection = document.getElementById('results-section');
    const resultsTbody = document.getElementById('results-tbody');
    
    // SVG and best candidate elements
    const bestScorePath = document.getElementById('best-score-path');
    const bestScoreText = document.getElementById('best-score-text');
    const bestName = document.getElementById('best-name');
    const bestSkills = document.getElementById('best-skills');
    const bestRecommendation = document.getElementById('best-recommendation');

    // File Upload Elements
    const dropZone = document.getElementById('drop-zone');
    const resumeUploadInput = document.getElementById('resume-upload');
    const fileListContainer = document.getElementById('file-list');

    let uploadedCandidates = []; // Array of { id, name, resumeText }

    // Setup Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    resumeUploadInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
        }
        e.target.value = '';
    });

    async function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (!['pdf', 'docx', 'txt'].includes(ext)) {
                alert(`File type .${ext} is not supported. Please upload PDF, DOCX, or TXT.`);
                continue;
            }

            const tempId = Date.now() + Math.random().toString(36).substr(2, 5);
            
            try {
                let textContent = '';
                
                if (ext === 'pdf') {
                    textContent = await extractTextFromPDF(file);
                } else if (ext === 'docx') {
                    textContent = await extractTextFromDocx(file);
                } else if (ext === 'txt') {
                    textContent = await file.text();
                }

                uploadedCandidates.push({
                    id: tempId,
                    name: file.name,
                    resume: textContent.trim()
                });
                
                renderFileList();

            } catch (err) {
                console.error("Error reading file", file.name, err);
                alert(`Could not extract text from ${file.name}.`);
            }
        }
    }

    function renderFileList() {
        fileListContainer.innerHTML = '';
        uploadedCandidates.forEach(cand => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <span class="file-name" title="${cand.name}">${cand.name}</span>
                <button class="remove-btn" data-id="${cand.id}">&times;</button>
            `;
            fileListContainer.appendChild(div);
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToRemove = e.target.getAttribute('data-id');
                uploadedCandidates = uploadedCandidates.filter(c => c.id !== idToRemove);
                renderFileList();
            });
        });
    }

    async function extractTextFromPDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(s => s.str).join(' ') + '\n';
        }
        return text;
    }

    async function extractTextFromDocx(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value;
    }

    // --- LOCAL KEYWORD EXTRACTION ---
    function getKeywordsFromJD(jd) {
        // If it's explicitly comma-separated list of skills, prioritize exact terms
        if (jd.includes(',')) {
            return jd.split(',')
                     .map(s => s.trim().toLowerCase())
                     .filter(s => s.length > 0);
        }

        // Otherwise auto-extract words > 2 chars ignoring common stop words
        const stopWords = new Set(["the","and","for","with","you","our","are","will","that","this","from","have","has","not","but","can","all", "your", "role", "skills", "experience", "requirements", "about", "what", "how", "who", "which", "why", "when", "where"]);
        const words = jd.toLowerCase().match(/\b[a-z0-9+#.]+\b/g) || [];
        return [...new Set(words.filter(w => w.length > 2 && !stopWords.has(w)))];
    }

    // Main Execution (100% Offline)
    analyzeBtn.addEventListener('click', async () => {
        const jd = document.getElementById('job-description').value.trim();

        if (!jd) {
            alert("Please enter a Job Description or a list of required skills.");
            return;
        }

        if (uploadedCandidates.length === 0) {
            alert("Please upload at least one resume file.");
            return;
        }

        analyzeBtn.disabled = true;
        loader.classList.remove('hidden');
        btnText.textContent = 'Analyzing...';
        resultsSection.classList.add('hidden');
        resultsTbody.innerHTML = '';

        try {
            const jdKeywords = getKeywordsFromJD(jd);
            
            // Artificial delay to simulate processing (purely for aesthetic UX)
            await new Promise(resolve => setTimeout(resolve, 800));

            const results = uploadedCandidates.map(c => processCandidate(c, jdKeywords));
            
            // Sort by score descending
            results.sort((a, b) => b.score - a.score);
            renderResults(results);

        } catch (error) {
            console.error(error);
            alert("An error occurred during analysis: " + error.message);
        } finally {
            analyzeBtn.disabled = false;
            loader.classList.add('hidden');
            btnText.textContent = 'Run Analysis';
        }
    });

    function processCandidate(candidate, jdKeywords) {
        const displayName = candidate.name.replace(/\.[^/.]+$/, "");
        const resumeText = candidate.resume.toLowerCase();
        
        let found = [];
        let missing = [];
        
        jdKeywords.forEach(kw => {
            // Precise whole-word matching logic (avoids matching "in" to "intern")
            // Escape special chars like c++ or c#
            const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const kwRegex = new RegExp(`\\b${escapedKw}\\b`, 'i');

            // If it's a multi-word phrase like "data visualization", just use standard includes fallback
            if (kwRegex.test(resumeText) || resumeText.includes(kw)) {
                found.push(kw);
            } else {
                missing.push(kw);
            }
        });

        let score = 0;
        if (jdKeywords.length > 0) {
            score = Math.round((found.length / jdKeywords.length) * 100);
        }

        let recommendation = "Not Fit";
        if (score > 75) {
            recommendation = "Strong Fit";
        } else if (score >= 50) {
            recommendation = "Moderate Fit";
        }

        // Capitalize for display and limit lists to reasonable size for table
        const displayFound = found.slice(0, 10).map(w => w.charAt(0).toUpperCase() + w.slice(1));
        const displayMissing = missing.slice(0, 10).map(w => w.charAt(0).toUpperCase() + w.slice(1));

        return {
            name: displayName,
            score: score,
            strengths: displayFound.length > 0 ? displayFound.join(', ') : 'None',
            gaps: displayMissing.length > 0 ? displayMissing.join(', ') : 'None',
            recommendation: recommendation
        };
    }

    function renderResults(results) {
        resultsSection.classList.remove('hidden');

        results.forEach(res => {
            const tr = document.createElement('tr');
            
            let statusClass = "not-fit";
            if (res.recommendation === "Strong Fit") statusClass = "strong";
            if (res.recommendation === "Moderate Fit") statusClass = "moderate";

            tr.innerHTML = `
                <td><strong>${res.name}</strong></td>
                <td class="score">${res.score}</td>
                <td>${res.strengths}</td>
                <td>${res.gaps}</td>
                <td><span class="status ${statusClass}">${res.recommendation}</span></td>
            `;
            resultsTbody.appendChild(tr);
        });

        if (results.length > 0) {
            const best = results[0];
            bestName.textContent = best.name;
            
            bestScoreText.textContent = `${best.score}%`;
            setTimeout(() => {
                bestScorePath.setAttribute('stroke-dasharray', `${best.score}, 100`);
            }, 100);

            bestSkills.innerHTML = '';
            const bestStrengthsArr = best.strengths.split(',').map(s => s.trim()).filter(s => s !== 'None');
            if (bestStrengthsArr.length === 0) {
                bestSkills.innerHTML = '<span class="tag">No specific match</span>';
            } else {
                bestStrengthsArr.forEach(s => {
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = s;
                    bestSkills.appendChild(span);
                });
            }

            bestRecommendation.textContent = `Matched ${best.score}% of JD Keywords. Top recommendation: ${best.recommendation}.`;
            
            let color = '#f85149'; 
            if (best.score > 75) color = '#3fb950'; 
            else if (best.score >= 50) color = '#d29922'; 
            bestScorePath.style.stroke = color;
        }
    }
});
