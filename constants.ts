
import { Subject, Question, Chapter } from './types';

export const SUBJECTS: Subject[] = [
  'Mathematics',
  'Science',
  'Social Science',
  'Hindi',
  'English'
];

export const CHAPTERS_BY_SUBJECT: Record<Subject, Chapter[]> = {
  'Mathematics': [
    { id: 'm-c1', name: 'Real Numbers (वास्तविक संख्याएँ)', description: 'Euclid division lemma, Fundamental theorem of arithmetic', totalQuestions: 15, completed: true },
    { id: 'm-c2', name: 'Polynomials (बहुपद)', description: 'Zeros of a polynomial, Relationship between zeros and coefficients', totalQuestions: 12, completed: false },
    { id: 'm-c3', name: 'Trigonometry (त्रिकोणमिति)', description: 'Ratios, Identities and Heights & Distances', totalQuestions: 20, completed: false },
    { id: 'm-c4', name: 'Quadratic Equations (द्विघात समीकरण)', description: 'Standard form, Solution by factorization', totalQuestions: 10, completed: false }
  ],
  'Science': [
    { id: 's-c1', name: 'Chemical Reactions (रासायनिक अभिक्रियाएँ)', description: 'Equations, Types of reactions', totalQuestions: 15, completed: false },
    { id: 's-c2', name: 'Light (प्रकाश)', description: 'Reflection and Refraction, Spherical mirrors', totalQuestions: 18, completed: false },
    { id: 's-c3', name: 'Life Processes (जैव प्रक्रम)', description: 'Nutrition, Respiration, Transportation', totalQuestions: 25, completed: false }
  ],
  'Social Science': [
    { id: 'ss-c1', name: 'History: Europe (यूरोप में राष्ट्रवाद)', description: 'Rise of nationalism in Europe', totalQuestions: 15, completed: false },
    { id: 'ss-c2', name: 'Geography (भारत: संसाधन एवं उपयोग)', description: 'Natural resources of India and Bihar', totalQuestions: 20, completed: false }
  ],
  'Hindi': [
    { id: 'h-c1', name: 'Shram Vibhajan (श्रम विभाजन और जाति प्रथा)', description: 'B.R. Ambedkar\'s essay analysis', totalQuestions: 10, completed: false },
    { id: 'h-c2', name: 'Vyakaran (व्याकरण)', description: 'Nouns, Case, and Gender in Hindi', totalQuestions: 30, completed: false }
  ],
  'English': [
    { id: 'e-c1', name: 'The Pace for Living', description: 'R.C. Hutchinson\'s outlook on modern life', totalQuestions: 12, completed: false }
  ]
};

export const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  'Real Numbers (वास्तविक संख्याएँ)': [
    {
      id: 'm1',
      question: 'दो क्रमिक सम संख्याओं का HCF क्या होगा?',
      options: ['1', '2', '3', '4'],
      correctAnswerIndex: 1,
      explanation: 'दो लगातार सम संख्याओं (जैसे 2, 4 या 10, 12) का महत्तम समापवर्तक (HCF) हमेशा 2 होता है।',
      difficulty: 'Beginner'
    },
    {
      id: 'm2',
      question: 'निम्न में से कौन अपरिमेय संख्या (Irrational Number) है?',
      options: ['√9', '√16', '√7', '√25'],
      correctAnswerIndex: 2,
      explanation: '√9=3, √16=4, √25=5 ये सभी परिमेय हैं, लेकिन √7 को p/q के रूप में नहीं लिखा जा सकता।',
      difficulty: 'Intermediate'
    }
  ],
  'Chemical Reactions (रासायनिक अभिक्रियाएँ)': [
    {
      id: 's1',
      question: 'लोहे को जिंक से लेपित करने की क्रिया को क्या कहते हैं?',
      options: ['संक्षारण', 'गैल्वेनीकरण', 'पानी चढ़ाना', 'विद्युत अपघटन'],
      correctAnswerIndex: 1,
      explanation: 'लोहे को जंग से बचाने के लिए उस पर जिंक की परत चढ़ाने की क्रिया को गैल्वेनीकरण (Galvanization) कहते हैं।',
      difficulty: 'Beginner'
    }
  ],
  'History: Europe (यूरोप में राष्ट्रवाद)': [
    {
      id: 'ss1',
      question: 'इटली एवं जर्मनी वर्तमान में किस महाद्वीप के अंतर्गत आते हैं?',
      options: ['उत्तरी अमेरिका', 'दक्षिणी अमेरिका', 'यूरोप', 'पश्चिमी एशिया'],
      correctAnswerIndex: 2,
      explanation: 'इटली और जर्मनी दोनों यूरोप महाद्वीप के प्रमुख देश हैं।',
      difficulty: 'Beginner'
    }
  ],
  'Shram Vibhajan (श्रम विभाजन और जाति प्रथा)': [
    {
      id: 'h1',
      question: 'श्रम विभाजन और जाति प्रथा के लेखक कौन हैं?',
      options: ['महात्मा गांधी', 'डॉ. भीमराव अंबेडकर', 'राममनोहर लोहिया', 'जवाहरलाल नेहरू'],
      correctAnswerIndex: 1,
      explanation: 'इस निबंध के लेखक आधुनिक मनु डॉ. भीमराव अंबेडकर हैं।',
      difficulty: 'Beginner'
    }
  ]
};
