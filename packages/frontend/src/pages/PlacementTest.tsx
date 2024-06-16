
import Button from '../components/FButton';
import { useState } from 'react';
import { sections } from './Questions';
import { BsCheckCircleFill , BsXCircleFill } from 'react-icons/bs';


export interface Question {
  text: string;
  sub: string;
  options: Option[];
}

export interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Selected {
  section: number;
  question: string;
  chosen: string;
  correct: string;
}

const optionsStyle =
  'bg-white border border-black rounded-md p-2 text-black text-xl w-1/3 mx-10 my-2 flex items-center hover:cursor-pointer hover:bg-[#2F6A75] duration-300';

const PlacementTest = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [sectionScore, setSectionScore] = useState(0);
  const [level, setLevel] = useState('');
  const [sectionSummary, setSectionSummary] = useState<Selected[]>([]);
  

  const optionClicked = (text: string) => {
    const currentSectionQuestions = sections[currentSection - 1];
    const currentQuestionObj = currentSectionQuestions[currentQuestion];
    const correctAnswer =
      currentQuestionObj.options.find(option => option.isCorrect)?.text || '';
    const question = currentQuestionObj.text;

    const isCorrect = text === correctAnswer;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1); // Increment score if the answer is correct
    }

    setSectionSummary(prev => [
      ...prev,
      {
        section: currentSection,
        question,
        chosen: text,
        correct: correctAnswer,
        isCorrect,
      },
    ]);

    if (currentQuestion + 1 < currentSectionQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowFeedback(true);
    }
  };

  const handleNextSection = () => {
    if (currentSection + 1 <= sections.length) {
      setSectionScore(sectionScore + 1);
      setCurrentSection(currentSection + 1); // Move to the next section
      setScore(0);
      setCurrentQuestion(0); // Start from the first question
      setSectionSummary([]); // Clear the summary array
      setShowFeedback(false); // Hide the feedback section
    }
  };
  const handleResult = () => {
    let updatedScore = sectionScore;

    if (score >= 5) {
      updatedScore += 1;
    }

    if (updatedScore < 2) {
      setLevel('A1');
    } else if (updatedScore === 2) {
      setLevel('A2');
    } else if (updatedScore === 3) {
      setLevel('B1');
    } else if (updatedScore === 4) {
      setLevel('B2');
    } else if (updatedScore === 5) {
      setLevel('C1');
    } else if (updatedScore === 6) {
      setLevel('C2');
    }

    setShowResult(true);
  };

  return (
    <main className="bg-[#FBF9F1] h-full min-h-screen">
      {showResult ? (
        <section className="w-full flex items-center h-1/3 flex-col gap-y-10 ">
          <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col items-center gap-10 p-8 ">
            <h1 className="text-4xl font-bold">Your Level is</h1>
            <img
              src={`assets/Levels/${level}.png`}
              alt={`${level} CEFR Level`}
              className="w-1/2 h-auto"
            />
          </div>
          <Button label="Continue" tag="3B828E"></Button>
        </section>
      ) : (
        <section className="w-full flex items-center h-3/4 flex-col justify-center">
          {showFeedback ? (
            <div className="w-full sm:w-3/4 md:w-1/2 flex flex-col gap-5 ">
              <div>
                <h1 className="text-3xl mb-10">Section Result</h1>
              </div>
              {sectionSummary.map((summary, index) => {
                 const isCorrect = summary.chosen === summary.correct;
                 const currentQuestionObj = sections[summary.section - 1].find(
                  q => q.text === summary.question
                );
                 return (  
                <div key={index}>
                  <div className='bg-white border py-4 px-4 '>
                  <div className='flex items-center' >  
                  {isCorrect ? <BsCheckCircleFill className="text-teal-500 inline-block " /> : <BsXCircleFill className="text-red-500 inline-block " />}
                    <h1 className='text-lg font-bold ml-2'>Question {index + 1} </h1>
                    
                  </div>  
                    <h2 className="text-md mt-3 mb-5">
                     {summary.question}
                    </h2>
                    <h2>{summary.correct}</h2>
                    <h2>{summary.chosen}</h2>
                     {currentQuestionObj && currentQuestionObj.options.map(option => (
                   <div
                       key={option.id}
                       className={`text-lg border p-2 mt-3 ${
                        option.text === summary.correct
                          ? 'border-teal-500'
                          : option.text === summary.chosen
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
            {option.text}
          </div>
        ))}
                   
                  </div>
                </div>
                 );
})}

              {score >= 5 && currentSection + 1 <= sections.length ? (
                <div className="w-1/2" onClick={handleNextSection}>
                  <Button label="Next Section" tag="3B828E" />
                </div>
              ) : (
                <div className="w-1/2" onClick={handleResult}>
                  <Button label="Show Result" tag="3B828E" />
                </div>
              )}
            </div>
          ) : (
            
            <div className="w-1/2 flex flex-col items-center rounded-xl bg-white p-10 border">
              <h2 className='text-3xl pb-12 font-semibold'>Placment Test</h2>
              <h3 className="text-3xl pb-12 pt-10">
                {sections[currentSection - 1][currentQuestion].text}
              </h3>
              <h5 className="text-2xl pb-12">
                {sections[currentSection - 1][currentQuestion].sub}
              </h5>
              <div className="flex flex-row w-full flex-wrap ">
                {sections[currentSection - 1][currentQuestion].options.map(
                  option => {
                    return (
                      <div
                        key={option.id}
                        className={optionsStyle}
                        onClick={() => optionClicked(option.text)}
                      >
                        {option.text}
                      </div>
                    );
                  },
                )}
              </div>

              
            </div>

            
            
            
          )}
        </section>
      )}
    </main>
  );
};

export default PlacementTest;
