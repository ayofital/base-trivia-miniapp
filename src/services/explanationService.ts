// Service to fetch explanations for trivia answers
export const explanationService = {
  fetchExplanation: async (question: string, correctAnswer: string, isCorrect: boolean): Promise<string> => {
    try {
      // Generate specific, factual explanations about WHY the answer is correct
      const factualExplanation = getFactualExplanation(question, correctAnswer);
      const educationalContext = getEducationalFact(question);
      
      const explanation = isCorrect
        ? `Excellent! ${correctAnswer} is correct. ${factualExplanation} ${educationalContext}`
        : `The correct answer is ${correctAnswer}. ${factualExplanation} ${educationalContext} ${getLearningTip(question, correctAnswer)}`;
      
      return explanation;
    } catch (error) {
      console.error('Error fetching explanation:', error);
      return isCorrect 
        ? `Well done! ${correctAnswer} is the right answer.`
        : `The correct answer is ${correctAnswer}. Keep learning!`;
    }
  }
};

// Helper to provide specific factual explanations about why the answer is correct
const getFactualExplanation = (question: string, answer: string): string => {
  const q = question.toLowerCase();
  const a = answer.toLowerCase();
  
  // Try to extract and explain the specific fact from the question
  // Binary/number-related questions
  if (q.includes('binary')) {
    if (q.includes('how many')) {
      return `Binary is a base-2 number system that uses only 0s and 1s.`;
    }
    return `In binary notation, ${answer} represents this value in base-2.`;
  }
  
  // Year/date questions
  if (q.includes('year') && q.includes('when')) {
    return `This significant event occurred in ${answer}.`;
  }
  
  // Location/geography questions
  if (q.includes('capital')) {
    return `${answer} serves as the capital city for this nation.`;
  }
  if (q.includes('located') || q.includes('where') || q.includes('country')) {
    return `${answer} is the correct geographical location for this.`;
  }
  if (q.includes('largest') || q.includes('biggest') || q.includes('smallest')) {
    return `${answer} holds this distinction in terms of size or scale.`;
  }
  
  // People/who questions
  if (q.includes('who')) {
    if (q.includes('wrote') || q.includes('author')) {
      return `${answer} is the author/creator of this work.`;
    }
    if (q.includes('invented') || q.includes('discovered')) {
      return `${answer} is credited with this invention/discovery.`;
    }
    if (q.includes('directed') || q.includes('director')) {
      return `${answer} directed this film.`;
    }
    if (q.includes('sang') || q.includes('singer') || q.includes('performed')) {
      return `${answer} is the artist behind this performance.`;
    }
    if (q.includes('painted') || q.includes('artist')) {
      return `${answer} created this artwork.`;
    }
    return `${answer} is the person associated with this achievement or event.`;
  }
  
  // What questions
  if (q.includes('what')) {
    if (q.includes('chemical symbol') || q.includes('symbol')) {
      return `${answer} is the standard chemical symbol used in scientific notation.`;
    }
    if (q.includes('element')) {
      return `${answer} is the chemical element in question.`;
    }
    if (q.includes('planet')) {
      return `${answer} is the planet being described.`;
    }
    if (q.includes('language')) {
      return `${answer} is the language spoken or used in this context.`;
    }
    if (q.includes('currency')) {
      return `${answer} is the official currency used.`;
    }
    if (q.includes('meaning') || q.includes('means')) {
      return `${answer} is the correct definition or meaning.`;
    }
    if (q.includes('name')) {
      return `${answer} is the proper name for this.`;
    }
  }
  
  // How many/much questions
  if (q.includes('how many') || q.includes('how much')) {
    return `The correct count or quantity is ${answer}.`;
  }
  
  // Animal questions
  if (q.includes('animal') || q.includes('species') || q.includes('bird') || q.includes('mammal')) {
    return `${answer} is the species or animal being described.`;
  }
  
  // Color questions
  if (q.includes('color') || q.includes('colour')) {
    return `${answer} is the correct color associated with this.`;
  }
  
  // True/False specific handling
  if (a === 'true' || a === 'false') {
    return `This statement is ${answer}.`;
  }
  
  // General fallback that still tries to be specific
  if (q.includes('film') || q.includes('movie')) {
    return `${answer} is the film/movie referenced in this question.`;
  }
  if (q.includes('book')) {
    return `${answer} is the book being asked about.`;
  }
  if (q.includes('song') || q.includes('album')) {
    return `${answer} is the song or album in question.`;
  }
  
  // Default factual explanation
  return `${answer} is the factually correct answer to this question.`;
};

// Helper to provide educational facts
const getEducationalFact = (question: string): string => {
  const q = question.toLowerCase();
  
  // Provide educational context based on question type
  if (q.includes('film') || q.includes('movie') || q.includes('actor')) {
    const facts = [
      'Cinema has a rich history that reflects culture and storytelling across generations.',
      'Movies are windows into different worlds, times, and perspectives.',
      'Film is an art form that combines visual storytelling, music, and performance.',
      'Every great film teaches us something new about the human experience.',
      'Cinema brings people together and sparks important conversations.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  if (q.includes('music') || q.includes('song') || q.includes('band')) {
    const facts = [
      'Music is a universal language that brings people together and expresses human emotions.',
      'Every musical note carries the power to inspire, heal, and connect us.',
      'Music transcends borders and creates bridges between cultures.',
      'Great music tells stories without words and touches the soul.',
      'Learning about music enriches your appreciation for creativity and expression.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  if (q.includes('country') || q.includes('capital') || q.includes('continent')) {
    const facts = [
      'Understanding geography helps us appreciate the diversity and beauty of our world.',
      'Every place on Earth has a unique story, culture, and natural wonder to discover.',
      'Geography connects us to the planet we call home and teaches us to care for it.',
      'Knowing about different places makes you a true citizen of the world.',
      'The world is full of amazing places waiting to be explored and understood.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  if (q.includes('animal') || q.includes('species')) {
    const facts = [
      'Learning about animals teaches us to respect and protect the natural world around us.',
      'Every creature plays an important role in maintaining the balance of nature.',
      'The animal kingdom is full of fascinating adaptations and survival strategies.',
      'Understanding wildlife helps us become better guardians of our planet.',
      "Nature's diversity is a treasure that inspires wonder and curiosity."
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  if (q.includes('year') || q.includes('war') || q.includes('century') || q.includes('history')) {
    const facts = [
      'History helps us understand the present and make better decisions for the future.',
      'Every historical event shaped the world we live in today.',
      'Learning from the past empowers us to create a better tomorrow.',
      'History is filled with inspiring stories of courage, innovation, and perseverance.',
      'Understanding history gives us perspective and wisdom for life.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  if (q.includes('science') || q.includes('element') || q.includes('planet')) {
    const facts = [
      'Science helps us discover how the world works and solve important problems.',
      'Every scientific discovery opens doors to new possibilities and innovations.',
      'Science empowers us to understand and improve our world.',
      "Curiosity and scientific thinking are keys to unlocking life's mysteries.",
      'The scientific method teaches us to question, explore, and never stop learning.'
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }
  
  // Generic inspirational facts for other categories
  const genericFacts = [
    'Every fact you learn expands your understanding of the world!',
    'Knowledge is the foundation of wisdom and personal growth.',
    'Curiosity is the spark that ignites lifelong learning.',
    'Each new thing you learn connects to create a bigger picture.',
    "Learning is a journey that never ends, and that's what makes it exciting!",
    'Your mind grows stronger with every new piece of knowledge.',
    'Education is the most powerful tool for changing the world.',
    'The more you know, the more amazing the world becomes!',
    'Every question you ask leads to new discoveries.',
    'Knowledge opens doors to endless opportunities and adventures.'
  ];
  return genericFacts[Math.floor(Math.random() * genericFacts.length)];
};

// Helper to provide age-friendly learning tips
const getLearningTip = (question: string, answer: string): string => {
  const q = question.toLowerCase();
  
  // Provide encouraging, age-appropriate tips
  if (q.includes('film') || q.includes('movie') || q.includes('actor')) {
    return `Watching classic films can be a fun way to learn about ${answer} and cinema history!`;
  }
  if (q.includes('music') || q.includes('song') || q.includes('band')) {
    return `Listening to different music styles helps you discover artists like ${answer}.`;
  }
  if (q.includes('country') || q.includes('capital') || q.includes('continent')) {
    return `Using maps and globes makes learning about places like ${answer} more fun!`;
  }
  if (q.includes('animal') || q.includes('species')) {
    return `Reading about ${answer} and watching nature documentaries is a great way to learn!`;
  }
  if (q.includes('year') || q.includes('war') || q.includes('century') || q.includes('history')) {
    return `Learning about ${answer} helps you understand how events shaped our world today.`;
  }
  if (q.includes('science') || q.includes('element') || q.includes('planet')) {
    return `Science experiments and observations help you understand concepts like ${answer}.`;
  }
  
  // Generic encouraging tips
  const genericTips = [
    `Don't worry! Now you know it's ${answer} - that's learning in action!`,
    `Remembering ${answer} will help you next time. Keep practicing!`,
    `Every mistake is a learning opportunity. You've just learned about ${answer}!`,
    `Great effort! Knowing ${answer} adds to your knowledge base.`
  ];
  return genericTips[Math.floor(Math.random() * genericTips.length)];
};
