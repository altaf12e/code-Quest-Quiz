/**
 * CodeQuest Chapters & Learning Path Logic
 * Supports full chapter learning view with all 9 required elements,
 * smooth navigation, interactive practice questions, and localStorage persistence.
 */

let currentSubject = 'java';
let currentChapterNumber = 1;
let chapters = [];
let selectedChapter = null;
let practiceAnswers = {};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentSubject = (urlParams.get('subject') || 'java').toLowerCase().trim();
    const initialChapter = urlParams.get('chapter');

    loadChapters();
    attachEventListeners();

    if (initialChapter) {
        const chNum = parseInt(initialChapter);
        if (!isNaN(chNum) && chNum >= 1 && chNum <= 5) {
            openChapterLearning(chNum, false);
        }
    }
});

/**
 * Load chapters for the active subject safely
 */
function loadChapters() {
    try {
        if (typeof getChaptersForSubject === 'function') {
            chapters = getChaptersForSubject(currentSubject);
        } else if (typeof CHAPTERS_DATA !== 'undefined' && CHAPTERS_DATA[currentSubject]) {
            chapters = CHAPTERS_DATA[currentSubject].map(ch => ({
                ...ch,
                isCompleted: checkChapterCompleted(currentSubject, ch.chapterNumber),
                isUnlocked: checkChapterUnlocked(currentSubject, ch.chapterNumber)
            }));
        } else {
            chapters = [];
        }
    } catch (e) {
        console.error('Error loading chapters data:', e);
        chapters = [];
    }

    updateUI();
    renderChapters();
}

/**
 * Update UI headers, overall progress bar & stats
 */
function updateUI() {
    const subjectName = formatSubjectName(currentSubject);
    const subjectTitleEl = document.getElementById('subjectTitle');
    if (subjectTitleEl) subjectTitleEl.textContent = `${subjectName} Learning Path`;

    const breadcrumbSubjEl = document.getElementById('breadcrumbSubject');
    if (breadcrumbSubjEl) breadcrumbSubjEl.textContent = subjectName;

    if (!chapters || chapters.length === 0) {
        const progText = document.getElementById('progressText');
        if (progText) progText.textContent = '0% Complete (0/5)';
        const progFill = document.getElementById('overallProgress');
        if (progFill) progFill.style.width = '0%';
        return;
    }

    const completedCount = chapters.filter(ch => ch.isCompleted).length;
    const totalCount = chapters.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const progText = document.getElementById('progressText');
    if (progText) progText.textContent = `${progressPercent}% Complete (${completedCount}/${totalCount})`;

    const progFill = document.getElementById('overallProgress');
    if (progFill) progFill.style.width = `${progressPercent}%`;

    const labelText = document.getElementById('progressLabelText');
    if (labelText) {
        labelText.textContent = `${completedCount} of ${totalCount} Chapters Completed • Keep going!`;
    }
}

/**
 * Render the 5 Chapter Cards on the Chapters List view
 */
function renderChapters() {
    const grid = document.getElementById('chaptersGrid');
    if (!grid) return;
    grid.innerHTML = '';

    chapters.forEach((chapter, index) => {
        const card = createChapterCard(chapter, index);
        grid.appendChild(card);
    });
}

/**
 * Build an individual chapter card for the grid
 */
function createChapterCard(chapter, index) {
    const card = document.createElement('div');
    const isCompleted = !!chapter.isCompleted;
    const isUnlocked = chapter.isUnlocked !== false;

    let statusClass = 'available';
    if (!isUnlocked) statusClass = 'locked';
    else if (isCompleted) statusClass = 'completed';

    card.className = `chapter-card ${statusClass}`;

    const diffColors = {
        'Beginner': '#10b981',
        'Intermediate': '#f59e0b',
        'Advanced': '#ef4444'
    };
    const diffColor = diffColors[chapter.difficulty] || '#8b5cf6';

    let footerButtonsHtml = '';
    if (isCompleted) {
        footerButtonsHtml = `
            <button class="btn btn-secondary btn-card-read" onclick="event.stopPropagation(); openChapterLearning(${chapter.chapterNumber});">
                📖 Re-read Chapter
            </button>
            <button class="btn btn-primary btn-card-quiz" onclick="event.stopPropagation(); launchChapterQuizDirect(${chapter.chapterNumber});">
                🚀 Quiz
            </button>
        `;
    } else if (isUnlocked) {
        footerButtonsHtml = `
            <button class="btn btn-primary btn-card-read btn-glow-pulse" onclick="event.stopPropagation(); openChapterLearning(${chapter.chapterNumber});">
                📖 Read Chapter ${chapter.chapterNumber} →
            </button>
            <button class="btn btn-secondary btn-card-quiz" onclick="event.stopPropagation(); launchChapterQuizDirect(${chapter.chapterNumber});">
                🚀 Quiz
            </button>
        `;
    } else {
        footerButtonsHtml = `
            <button class="btn btn-secondary btn-card-read" style="opacity: 0.6; cursor: not-allowed;" onclick="event.stopPropagation(); showToast('🔒 Complete Chapter ${chapter.chapterNumber - 1} first to unlock Chapter ${chapter.chapterNumber} for reading!', 'info');">
                🔒 Locked (Complete Ch ${chapter.chapterNumber - 1})
            </button>
        `;
    }

    card.innerHTML = `
        <div class="chapter-card-header">
            <div class="chapter-number-circle">${chapter.chapterNumber}</div>
            <div class="chapter-status-pill ${statusClass}">
                ${isCompleted ? '⭐ Completed' : (isUnlocked ? '▶ Ready to Read' : `🔒 Locked (Complete Ch ${chapter.chapterNumber - 1})`)}
            </div>
        </div>

        <div class="chapter-content">
            <h3 class="chapter-title">${chapter.title}</h3>
            <p class="chapter-description">${chapter.intro || chapter.summary || 'Master this topic step by step.'}</p>
            
            <div class="chapter-meta">
                <span class="chapter-meta-chip">⏱️ ${chapter.estimatedTime || 15} min</span>
                <span class="chapter-meta-chip" style="color: ${diffColor};">📊 ${chapter.difficulty || 'Beginner'}</span>
                <span class="chapter-meta-chip">🧠 5 Practice Qs</span>
            </div>
        </div>

        <div class="chapter-card-footer">
            ${footerButtonsHtml}
        </div>
    `;

    // Clicking anywhere on card opens the learning content directly if unlocked
    card.addEventListener('click', () => {
        if (!isUnlocked) {
            showToast(`🔒 Please complete Chapter ${chapter.chapterNumber - 1} first to unlock Chapter ${chapter.chapterNumber}!`, 'info');
            return;
        }
        openChapterLearning(chapter.chapterNumber);
    });

    return card;
}

/**
 * Open Chapter Learning View (renders all 9 requested elements)
 */
function openChapterLearning(chapterNumber, updateHistory = true) {
    currentChapterNumber = parseInt(chapterNumber);
    
    // Retrieve chapter data
    let chData = null;
    if (typeof getChapterData === 'function') {
        chData = getChapterData(currentSubject, currentChapterNumber);
    }
    if (!chData && typeof CHAPTERS_DATA !== 'undefined' && CHAPTERS_DATA[currentSubject]) {
        chData = CHAPTERS_DATA[currentSubject].find(c => c.chapterNumber === currentChapterNumber);
    }

    if (!chData) {
        showToast('Chapter content not found', 'error');
        return;
    }

    selectedChapter = chData;
    practiceAnswers = {};

    // Update URL query parameters without reloading
    if (updateHistory) {
        const newUrl = `${window.location.pathname}?subject=${encodeURIComponent(currentSubject)}&chapter=${currentChapterNumber}`;
        window.history.pushState({ subject: currentSubject, chapter: currentChapterNumber }, '', newUrl);
    }

    // Toggle views: Hide list, show learning
    const listView = document.getElementById('chaptersListView');
    const learnView = document.getElementById('chapterLearningView');
    if (listView) listView.style.display = 'none';
    if (learnView) learnView.style.display = 'block';

    // 1. Header & Badges
    document.getElementById('breadcrumbChapter').textContent = `Chapter ${currentChapterNumber}: ${chData.title}`;
    document.getElementById('learnChapterBadge').textContent = `Chapter ${currentChapterNumber} of 5`;
    document.getElementById('learnDifficultyBadge').textContent = chData.difficulty || 'Beginner';
    document.getElementById('learnTimeBadge').textContent = `⏱️ ${chData.estimatedTime || 15} min read`;
    
    const isCompleted = checkChapterCompleted(currentSubject, currentChapterNumber);
    const statusBadge = document.getElementById('learnStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = isCompleted ? '✅ Completed' : '📖 In Progress';
        statusBadge.className = `badge badge-status ${isCompleted ? 'badge-completed' : 'badge-progress'}`;
    }

    document.getElementById('learnTitle').textContent = `${currentChapterNumber}. ${chData.title}`;

    // 2. Simple Introduction
    const introEl = document.getElementById('learnIntroText');
    if (introEl) introEl.textContent = chData.intro;

    // 3. 4-6 Easy English Paragraphs
    const paragraphsContainer = document.getElementById('learnParagraphsContainer');
    if (paragraphsContainer) {
        paragraphsContainer.innerHTML = '';
        (chData.paragraphs || []).forEach(pText => {
            const p = document.createElement('p');
            p.className = 'learning-paragraph';
            p.innerHTML = formatMarkdownHighlights(pText);
            paragraphsContainer.appendChild(p);
        });
    }

    // 4. Important Points (Key bullet takeaways)
    const pointsList = document.getElementById('learnPointsList');
    if (pointsList) {
        pointsList.innerHTML = '';
        (chData.importantPoints || []).forEach(pt => {
            const li = document.createElement('li');
            li.className = 'important-point-item';
            li.innerHTML = `<span class="point-bullet">✓</span><span class="point-text">${formatMarkdownHighlights(pt)}</span>`;
            pointsList.appendChild(li);
        });
    }

    // 5. Simple Examples and Code
    const codeBlock = document.getElementById('learnCodeBlock');
    if (codeBlock) {
        codeBlock.textContent = chData.codeExample || '// No code example available';
    }
    const codeLangTag = document.getElementById('codeLangTag');
    if (codeLangTag) {
        codeLangTag.textContent = formatSubjectName(currentSubject).toUpperCase();
    }
    const terminalFileName = document.getElementById('terminalFileName');
    if (terminalFileName) {
        terminalFileName.textContent = getSampleFileName(currentSubject, currentChapterNumber);
    }

    // 6. Explanation of the Code
    const explanationList = document.getElementById('learnCodeExplanationList');
    if (explanationList) {
        explanationList.innerHTML = '';
        (chData.codeExplanation || []).forEach(exp => {
            const li = document.createElement('li');
            li.className = 'code-explanation-item';
            li.innerHTML = `<span class="exp-bullet">📌</span><span class="exp-text">${formatMarkdownHighlights(exp)}</span>`;
            explanationList.appendChild(li);
        });
    }

    // 7. Short Chapter Summary
    const summaryText = document.getElementById('learnSummaryText');
    if (summaryText) {
        summaryText.innerHTML = formatMarkdownHighlights(chData.summary || 'Summary coming soon.');
    }

    // 8. 5 Practice Questions
    renderPracticeQuestions(chData.practiceQuestions || []);

    // 9. Update Navigation Action Bar & Next Chapter Milestone Card
    updateLearningActionBar(isCompleted);
    updateMilestoneCard(isCompleted);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render the 5 Interactive Practice Questions
 */
function renderPracticeQuestions(questions) {
    const container = document.getElementById('learnPracticeQuestionsContainer');
    if (!container) return;
    container.innerHTML = '';

    const scorePill = document.getElementById('practiceScorePill');
    if (scorePill) scorePill.textContent = `Score: 0 / ${questions.length}`;

    questions.forEach((q, qIndex) => {
        const qCard = document.createElement('div');
        qCard.className = 'practice-question-card';
        qCard.id = `practiceQ_${qIndex}`;

        let optionsHtml = '';
        q.options.forEach((opt, optIndex) => {
            const optLetter = String.fromCharCode(65 + optIndex);
            optionsHtml += `
                <button class="practice-option" onclick="handlePracticeOptionClick(${qIndex}, ${optIndex}, ${q.correctAnswer})">
                    <span class="practice-option-letter">${optLetter}</span>
                    <span class="practice-option-text">${escapeHtml(opt)}</span>
                </button>
            `;
        });

        qCard.innerHTML = `
            <div class="practice-q-header">
                <span class="practice-q-number">Question ${qIndex + 1} of ${questions.length}</span>
                <span class="practice-q-status" id="practiceStatus_${qIndex}">Pending</span>
            </div>
            <h4 class="practice-q-text">${escapeHtml(q.question)}</h4>
            <div class="practice-options-grid" id="practiceOptions_${qIndex}">
                ${optionsHtml}
            </div>
            <div class="practice-explanation-box" id="practiceExp_${qIndex}" style="display: none;">
                <span class="exp-icon">💡</span>
                <div class="exp-content">
                    <strong>Explanation:</strong> ${escapeHtml(q.explanation || 'Great job!')}
                </div>
            </div>
        `;

        container.appendChild(qCard);
    });
}

/**
 * Handle clicking on a practice question option
 */
function handlePracticeOptionClick(qIndex, selectedOptIndex, correctIndex) {
    const optionsContainer = document.getElementById(`practiceOptions_${qIndex}`);
    if (!optionsContainer) return;

    const allButtons = optionsContainer.querySelectorAll('.practice-option');
    if (allButtons.length === 0) return;

    // Check if already answered
    if (practiceAnswers[qIndex] !== undefined) return;
    practiceAnswers[qIndex] = selectedOptIndex;

    const isCorrect = (selectedOptIndex === correctIndex);

    // Style buttons
    allButtons.forEach((btn, idx) => {
        btn.classList.add('disabled');
        if (idx === correctIndex) {
            btn.classList.add('correct');
        } else if (idx === selectedOptIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Update status tag
    const statusEl = document.getElementById(`practiceStatus_${qIndex}`);
    if (statusEl) {
        if (isCorrect) {
            statusEl.textContent = '✅ Correct';
            statusEl.className = 'practice-q-status correct';
        } else {
            statusEl.textContent = '❌ Incorrect';
            statusEl.className = 'practice-q-status incorrect';
        }
    }

    // Reveal explanation
    const expBox = document.getElementById(`practiceExp_${qIndex}`);
    if (expBox) expBox.style.display = 'flex';

    // Play sound if available
    if (typeof playSound === 'function') {
        playSound(isCorrect ? 'correct' : 'error');
    }

    // Update score pill and auto-complete if passing
    updatePracticeScore();
}

/**
 * Update the practice question score pill and auto-unlock next chapter if passing
 */
function updatePracticeScore() {
    if (!selectedChapter || !selectedChapter.practiceQuestions) return;
    const total = selectedChapter.practiceQuestions.length;
    let correctCount = 0;
    let answeredCount = 0;

    selectedChapter.practiceQuestions.forEach((q, idx) => {
        if (practiceAnswers[idx] !== undefined) {
            answeredCount++;
            if (practiceAnswers[idx] === q.correctAnswer) {
                correctCount++;
            }
        }
    });

    const scorePill = document.getElementById('practiceScorePill');
    if (scorePill) {
        scorePill.textContent = `Score: ${correctCount} / ${total} Correct`;
        if (correctCount === total && total > 0) {
            scorePill.classList.add('all-correct');
        }
    }

    // If user answered all practice questions and got at least 3/5 correct, automatically mark chapter complete
    if (answeredCount === total && correctCount >= 3) {
        if (!checkChapterCompleted(currentSubject, currentChapterNumber)) {
            saveChapterCompletion(currentSubject, currentChapterNumber, true);
            showToast(`🎉 Practice complete! Chapter ${currentChapterNumber} completed & Next Chapter unlocked!`, 'success');
            loadChapters();
            updateLearningActionBar(true);
            updateMilestoneCard(true);

            const statusBadge = document.getElementById('learnStatusBadge');
            if (statusBadge) {
                statusBadge.textContent = '✅ Completed';
                statusBadge.className = 'badge badge-status badge-completed';
            }
        }
    }
}

/**
 * Update the Next Chapter Milestone Card on the learning page
 */
function updateMilestoneCard(isCompleted) {
    const milestoneCard = document.getElementById('nextChapterMilestoneCard');
    if (!milestoneCard) return;

    if (!isCompleted) {
        milestoneCard.style.display = 'none';
        return;
    }

    const nextChNum = currentChapterNumber + 1;
    const subjectName = formatSubjectName(currentSubject);

    if (nextChNum <= 5) {
        const nextChData = (typeof getChapterData === 'function') ? getChapterData(currentSubject, nextChNum) : null;
        const nextTitle = nextChData ? nextChData.title : `Chapter ${nextChNum}`;

        milestoneCard.style.display = 'flex';
        milestoneCard.innerHTML = `
            <div class="milestone-badge-glow">🎉 CHAPTER ${currentChapterNumber} COMPLETED!</div>
            <h3 class="milestone-title">Chapter ${nextChNum} Unlocked: ${nextTitle}</h3>
            <p class="milestone-desc">
                Awesome work! You have finished Chapter ${currentChapterNumber}. 
                You can now read the next chapter of <strong>${subjectName}</strong> or test your knowledge with the chapter quiz.
            </p>
            <div class="milestone-buttons">
                <button class="btn btn-primary btn-next-read-pulse" onclick="openChapterLearning(${nextChNum})">
                    📖 Read Chapter ${nextChNum}: ${nextTitle} →
                </button>
                <button class="btn btn-secondary" onclick="startCurrentChapterQuiz()">
                    🚀 Take Chapter ${currentChapterNumber} Quiz
                </button>
                <button class="btn btn-secondary" onclick="showChaptersList()">
                    📋 View All Chapters
                </button>
            </div>
        `;
    } else {
        milestoneCard.style.display = 'flex';
        milestoneCard.innerHTML = `
            <div class="milestone-badge-glow gold">🏆 ${subjectName.toUpperCase()} FULLY COMPLETED!</div>
            <h3 class="milestone-title">Congratulations! All 5 Chapters Completed!</h3>
            <p class="milestone-desc">
                You have finished all chapter reading paths for <strong>${subjectName}</strong>. You are fully prepared to take the main Proctored Exam!
            </p>
            <div class="milestone-buttons">
                <a href="dashboard.html" class="btn btn-primary btn-next-read-pulse">
                    ⚔️ Go to Dashboard
                </a>
                <button class="btn btn-secondary" onclick="showChaptersList()">
                    📋 Review Chapter List
                </button>
            </div>
        `;
    }
}

/**
 * Update the bottom action bar buttons based on chapter & completion state
 */
function updateLearningActionBar(isCompleted) {
    const prevBtn = document.getElementById('prevChapterBtn');
    if (prevBtn) {
        prevBtn.disabled = (currentChapterNumber <= 1);
        prevBtn.style.opacity = (currentChapterNumber <= 1) ? '0.5' : '1';
        if (currentChapterNumber > 1) {
            prevBtn.onclick = () => openChapterLearning(currentChapterNumber - 1);
        }
    }

    const nextBtn = document.getElementById('nextChapterBtn');
    if (nextBtn) {
        if (currentChapterNumber >= 5) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            nextBtn.innerHTML = 'All 5 Chapters Complete 🏆';
            nextBtn.className = 'btn btn-secondary';
        } else {
            const nextChNum = currentChapterNumber + 1;
            const nextChData = (typeof getChapterData === 'function') ? getChapterData(currentSubject, nextChNum) : null;
            const nextTitle = nextChData ? nextChData.title : `Chapter ${nextChNum}`;

            if (isCompleted) {
                // CHAPTER COMPLETED: Show prominent, glowing button to read next chapter!
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.innerHTML = `📖 Read Chapter ${nextChNum}: ${nextTitle} →`;
                nextBtn.className = 'btn btn-primary btn-next-chapter-active';
                nextBtn.onclick = () => openChapterLearning(nextChNum);
            } else {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '0.9';
                nextBtn.innerHTML = `Next: Chapter ${nextChNum} →`;
                nextBtn.className = 'btn btn-secondary';
                nextBtn.onclick = () => openChapterLearning(nextChNum);
            }
        }
    }

    const markBtn = document.getElementById('markCompletedBtn');
    if (markBtn) {
        if (isCompleted) {
            markBtn.innerHTML = '✅ Completed (Click to Reset)';
            markBtn.className = 'btn btn-secondary-completed';
        } else {
            markBtn.innerHTML = '⭐ Mark as Completed (+50 XP)';
            markBtn.className = 'btn btn-success-glow';
        }
    }
}

/**
 * Toggle chapter completed status in localStorage
 */
function toggleChapterCompletion() {
    const isCurrentlyCompleted = checkChapterCompleted(currentSubject, currentChapterNumber);
    const newStatus = !isCurrentlyCompleted;

    saveChapterCompletion(currentSubject, currentChapterNumber, newStatus);

    if (newStatus) {
        const nextNum = currentChapterNumber + 1;
        if (nextNum <= 5) {
            showToast(`🎉 Chapter ${currentChapterNumber} completed! Chapter ${nextNum} is now unlocked!`, 'success');
        } else {
            showToast(`🏆 All chapters completed in ${formatSubjectName(currentSubject)}!`, 'success');
        }
        if (typeof playSound === 'function') playSound('success');
    } else {
        showToast(`Chapter ${currentChapterNumber} reset to In Progress`, 'info');
    }

    // Refresh chapters array & UI
    loadChapters();
    updateLearningActionBar(newStatus);
    updateMilestoneCard(newStatus);

    const statusBadge = document.getElementById('learnStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = newStatus ? '✅ Completed' : '📖 In Progress';
        statusBadge.className = `badge badge-status ${newStatus ? 'badge-completed' : 'badge-progress'}`;
    }

    if (newStatus && currentChapterNumber < 5) {
        const milestoneCard = document.getElementById('nextChapterMilestoneCard');
        if (milestoneCard) {
            milestoneCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/**
 * Navigate to Previous or Next chapter
 */
function navigateChapter(delta) {
    const targetChapter = currentChapterNumber + delta;
    if (targetChapter < 1 || targetChapter > 5) return;
    openChapterLearning(targetChapter);
}

/**
 * Return to Chapter List View
 */
function showChaptersList() {
    const listView = document.getElementById('chaptersListView');
    const learnView = document.getElementById('chapterLearningView');
    if (listView) listView.style.display = 'block';
    if (learnView) learnView.style.display = 'none';

    // Update URL query parameter
    const newUrl = `${window.location.pathname}?subject=${encodeURIComponent(currentSubject)}`;
    window.history.pushState({ subject: currentSubject }, '', newUrl);

    // Refresh list data
    loadChapters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Launch quiz specifically for current chapter
 */
function startCurrentChapterQuiz() {
    if (!selectedChapter) {
        showToast('Please select a chapter first', 'error');
        return;
    }

    localStorage.setItem('currentChapter', JSON.stringify({
        subject: currentSubject,
        chapterNumber: currentChapterNumber,
        title: selectedChapter.title,
        difficulty: selectedChapter.difficulty || 'beginner',
        startTime: Date.now()
    }));

    if (typeof playSound === 'function') playSound('select');
    window.location.href = 'chapter-quiz.html';
}

/**
 * Direct launch from chapter card quiz button
 */
function launchChapterQuizDirect(chapterNumber) {
    const ch = (chapters || []).find(c => c.chapterNumber === chapterNumber);
    localStorage.setItem('currentChapter', JSON.stringify({
        subject: currentSubject,
        chapterNumber: chapterNumber,
        title: ch ? ch.title : `Chapter ${chapterNumber}`,
        difficulty: ch ? (ch.difficulty || 'beginner') : 'beginner',
        startTime: Date.now()
    }));

    if (typeof playSound === 'function') playSound('select');
    window.location.href = 'chapter-quiz.html';
}

/**
 * Copy current code snippet to clipboard
 */
function copyCurrentCode() {
    const codeBlock = document.getElementById('learnCodeBlock');
    if (!codeBlock) return;

    const text = codeBlock.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const copyBtnText = document.getElementById('copyCodeText');
        const copyIcon = document.getElementById('copyCodeIcon');
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        if (copyIcon) copyIcon.textContent = '✅';

        showToast('Code copied to clipboard!', 'success');

        setTimeout(() => {
            if (copyBtnText) copyBtnText.textContent = 'Copy Code';
            if (copyIcon) copyIcon.textContent = '📋';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        showToast('Failed to copy code', 'error');
    });
}

/**
 * Modal helpers (backward compatibility)
 */
function showChapterModal(chapter) {
    selectedChapter = chapter;
    document.getElementById('modalChapterTitle').textContent = `Chapter ${chapter.chapterNumber}: ${chapter.title}`;
    document.getElementById('modalChapterDescription').textContent = chapter.intro || chapter.summary || '';
    document.getElementById('modalEstimatedTime').textContent = `${chapter.estimatedTime || 15} min`;
    document.getElementById('modalDifficulty').textContent = chapter.difficulty || 'Beginner';
    document.getElementById('modalQuestionCount').textContent = `5 questions`;

    const modal = document.getElementById('chapterModal');
    if (modal) modal.classList.add('active');
}

function closeChapterModal() {
    const modal = document.getElementById('chapterModal');
    if (modal) modal.classList.remove('active');
}

function openChapterFromModal() {
    closeChapterModal();
    if (selectedChapter) {
        openChapterLearning(selectedChapter.chapterNumber);
    }
}

function startQuizFromModal() {
    closeChapterModal();
    if (selectedChapter) {
        launchChapterQuizDirect(selectedChapter.chapterNumber);
    }
}

/**
 * LocalStorage progress helpers (delegates to chaptersData.js)
 */
function checkChapterCompleted(subject, chapterNumber) {
    if (typeof isChapterCompleted === 'function') {
        return isChapterCompleted(subject, chapterNumber);
    }
    return false;
}

function checkChapterUnlocked(subject, chapterNumber) {
    if (typeof isChapterUnlocked === 'function') {
        return isChapterUnlocked(subject, chapterNumber);
    }
    return parseInt(chapterNumber) <= 1;
}

function saveChapterCompletion(subject, chapterNumber, completed) {
    if (typeof markChapterCompleted === 'function') {
        markChapterCompleted(subject, chapterNumber, completed);
    }
}

/**
 * Formatting & utility functions
 */
function formatSubjectName(subj) {
    if (!subj) return 'Java';
    const map = {
        'java': 'Java',
        'cpp': 'C++',
        'python': 'Python',
        'javascript': 'JavaScript',
        'data-structures': 'Data Structures',
        'algorithms': 'Algorithms'
    };
    return map[subj] || subj.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getSampleFileName(subj, chNum) {
    const exts = {
        'java': `Chapter${chNum}Demo.java`,
        'cpp': `chapter${chNum}_demo.cpp`,
        'python': `chapter_${chNum}_demo.py`,
        'javascript': `chapter${chNum}Demo.js`,
        'data-structures': `ds_chapter_${chNum}.cpp`,
        'algorithms': `algo_chapter_${chNum}.py`
    };
    return exts[subj] || `example.txt`;
}

function formatMarkdownHighlights(text) {
    if (!text) return '';
    let formatted = escapeHtml(text);
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    return formatted;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const style = {
        position: 'fixed',
        top: '25px',
        right: '25px',
        padding: '0.9rem 1.4rem',
        borderRadius: '12px',
        color: '#ffffff',
        fontWeight: '600',
        zIndex: '99999',
        fontSize: '0.95rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
    };

    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    };

    Object.assign(toast.style, style);
    toast.style.background = colors[type] || colors.info;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3200);
}

// Window popstate support for browser back/forward buttons
window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const ch = params.get('chapter');
    if (ch) {
        openChapterLearning(parseInt(ch), false);
    } else {
        showChaptersList();
    }
});

function attachEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeChapterModal();
    });

    const backDashBtn = document.getElementById('backToDashboardBtn');
    if (backDashBtn) {
        backDashBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('select');
        });
    }
}

// Global exposure for inline onclick attributes
window.openChapterLearning = openChapterLearning;
window.showChaptersList = showChaptersList;
window.toggleChapterCompletion = toggleChapterCompletion;
window.navigateChapter = navigateChapter;
window.startCurrentChapterQuiz = startCurrentChapterQuiz;
window.launchChapterQuizDirect = launchChapterQuizDirect;
window.copyCurrentCode = copyCurrentCode;
window.handlePracticeOptionClick = handlePracticeOptionClick;
window.showChapterModal = showChapterModal;
window.closeChapterModal = closeChapterModal;
window.openChapterFromModal = openChapterFromModal;
window.startQuizFromModal = startQuizFromModal;
