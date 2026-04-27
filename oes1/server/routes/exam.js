const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Question = require('../models/Question');

router.get('/questions', protect, async (req, res) => {
    try {
        const { subject, difficulty, subLevel, limit = 10 } = req.query;
        const questionLimit = parseInt(limit) || 10;

        const query = {};
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;
        if (subLevel) query.subLevel = subLevel;

        let questions = await Question.find(query).select('_id question options correctAnswer hint xpValue section').lean();

        if (questions.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No questions found for this subject/difficulty' 
            });
        }

        // Group questions by section
        const sections = ['fundamentals', 'intermediate', 'advanced', 'practical'];
        const questionsBySection = {};
        
        sections.forEach(section => {
            questionsBySection[section] = questions.filter(q => q.section === section);
        });

        // Distribute questions evenly across sections
        const questionsPerSection = Math.ceil(questionLimit / sections.length);
        let finalQuestions = [];
        
        sections.forEach(section => {
            let sectionQuestions = questionsBySection[section];
            if (sectionQuestions.length === 0) {
                // If no questions in this section, use from other sections
                sectionQuestions = questions.filter(q => !finalQuestions.includes(q));
            }
            
            sectionQuestions = shuffleArray(sectionQuestions);
            const selectedQuestions = sectionQuestions.slice(0, questionsPerSection);
            finalQuestions = finalQuestions.concat(selectedQuestions);
        });

        // Trim to exact limit
        finalQuestions = finalQuestions.slice(0, questionLimit);

        const questionsWithShuffledOptions = finalQuestions.map(q => {
            const qObj = q.toObject ? q.toObject() : q;
            const { correctAnswer, options, ...rest } = qObj;
            
            const optionIndices = options.map((opt, idx) => ({ option: opt, originalIndex: idx }));
            const shuffledOptions = shuffleArray(optionIndices);
            
            const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIndex === correctAnswer);
            
            return {
                ...rest,
                options: shuffledOptions.map(item => item.option),
                correctAnswer: newCorrectIndex
            };
        });

        // Group final questions by section for frontend
        const organizedSections = {};
        sections.forEach(section => {
            organizedSections[section] = questionsWithShuffledOptions.filter(q => q.section === section);
        });

        res.json({
            success: true,
            count: questionsWithShuffledOptions.length,
            questions: questionsWithShuffledOptions,
            sections: organizedSections
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching questions' });
    }
});

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

router.post('/check-answer', protect, async (req, res) => {
    try {
        const { questionId, selectedAnswer, correctAnswerIndex } = req.body;

        let actualQuestionId = questionId;
        if (questionId.includes('_')) {
            actualQuestionId = actualQuestionId.split('_')[0];
        }

        const question = await Question.findById(actualQuestionId).select('correctAnswer xpValue').lean();
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const correctIndex = correctAnswerIndex !== undefined ? correctAnswerIndex : question.correctAnswer;
        const isCorrect = correctIndex === selectedAnswer;

        res.json({
            success: true,
            isCorrect,
            correctAnswer: correctIndex,
            xpEarned: isCorrect ? question.xpValue : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error checking answer' });
    }
});

router.get('/hint/:questionId', protect, async (req, res) => {
    try {
        let actualQuestionId = req.params.questionId;
        if (actualQuestionId.includes('_')) {
            actualQuestionId = actualQuestionId.split('_')[0];
        }

        const question = await Question.findById(actualQuestionId).select('hint').lean();
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        res.json({
            success: true,
            hint: question.hint
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching hint' });
    }
});

module.exports = router;
