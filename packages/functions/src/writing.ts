import {
  BedrockRuntime,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { runModel , Rubric } from './utilities';

export const main: APIGatewayProxyHandlerV2 = async event => {
  if (event.body == undefined) {
    return { statusCode: 400, body: 'No valid input' };
  }

  const requestBody = JSON.parse(event.body);
  // TOOD: assert answer and question exist in body
  const { answer, question } = requestBody;

  const criterias = [
    'Coherence & Cohesion',
    'Grammatical Range & Accuracy',
    'Lexical Resource',
    'Task Responce',
  ];

  const _feedbacks = criterias.map(async criteria => {
    const prompt = createPrompt(criteria, rubric[criteria], question, answer);
    const feedback = await runModel(prompt);
    return feedback;
  });

  const feedbacks = await Promise.all(_feedbacks);

  const out = {
    'Coherence & Cohesion': feedbacks[0],
    'Grammatical Range & Accuracy': feedbacks[1],
    'Lexical Resource': feedbacks[2],
    'Task Responce': feedbacks[3],
  };

  return {
    statusCode: 200,
    body: JSON.stringify(out),
  };
};


/**
 * IELTS grading rubric for writing task 2 grading.
 *
 * Key is grading criteria and value is text of grading descriptors.
 */
const rubric : Rubric = {
  'Coherence & Cohesion':
    'Score: 9\nThe message can be followed effortlessly.\n\nCohesion is used in such a way that it very rarely attracts attention.\n\nAny lapses in coherence or cohesion are minimal.\n\nParagraphing is skilfully managed.\n--------------------\n\nScore: 8\nThe message can be followed with ease.\n\nInformation and ideas are logically sequenced, and cohesion is well managed.\n\nOccasional lapses in coherence and cohesion may occur.\n\nParagraphing is used sufficiently and appropriately.\n--------------------\n\nScore: 7\nInformation and ideas are logically organised, and there is a clear progression throughout the response. (A few lapses may occur, but these are minor.)\n\nA range of cohesive devices including reference and substitution is used flexibly but with some inaccuracies or some over/under use.\n\nParagraphing is generally used effectively to support overall coherence, and the sequencing of ideas within a paragraph is generally logical.\n--------------------\n\nScore: 6\nInformation and ideas are generally arranged coherently and there is a clear overall progression.\n\nCohesive devices are used to some good effect but cohesion within and/or between sentences may be faulty or mechanical due to misuse, overuse or omission.\n\nThe use of reference and substitution may lack flexibility or clarity and result in some repetition or error.\n\nParagraphing may not always be logical and/or the central topic may not always be clear.\n--------------------\n\nScore: 5\nOrganisation is evident but is not wholly logical and there may be a lack of overall progression.  Nevertheless, there is a sense of underlying coherence to the response.\n\nThe relationship of ideas can be followed but the sentences are not fluently linked to each other.\n\nThere may be limited/overuse of cohesive devices with some inaccuracy.\n\nThe writing may be repetitive due to inadequate and/or inaccurate use of reference and substitution.\n\n**Paragraphing may be inadequate or missing**.\n--------------------\n\nScore: 4\nInformation and ideas are evident but not arranged coherently and there is no clear progression within the response.\n\nRelationships between ideas can be unclear and/or inadequately marked. There is some use of basic cohesive devices, which may be inaccurate or repetitive.\n\nThere is inaccurate use or a lack of substitution or referencing.\n\nThere may be no paragraphing and/or no clear main topic within paragraphs.\n--------------------\n\nScore: 3\nThere is no apparent logical organisation. Ideas are discernible but difficult to relate to each other.\n\nThere is minimal use of sequencers or cohesive devices.  Those used do not necessarily indicate a logical relationship between ideas.\n\nThere is difficulty in identifying referencing.\n\n Any attempts at paragraphing are unhelpful.\n--------------------\n\nScore: 2\nThere is little relevant message, or the **entire response may be off-topic**.\n\nThere is little evidence of control of organisational features.\n--------------------\n\nScore: 1\nResponses of 20 words or fewer are rated at Band 1.\n\nThe writing fails to communicate any message and appears to be by a virtual non-writer.\n--------------------\n\nScore: 0\nShould only be used where a candidate did not attend or attempt the question in any way, used a language other than English throughout, or where there is proof that a candidate\xe2\x80\x99s answer has been totally memorised.\n--------------------\n\n',
  'Grammatical Range & Accuracy':
    'Score: 9\nA wide range of structures is used with full flexibility and control.\n\nPunctuation and grammar are used appropriately throughout.\n\nMinor errors are extremely rare and have minimal impact on communication.\n--------------------\n\nScore: 8\nA wide range of structures is flexibly and accurately used.\n\nThe majority of sentences are error-free, and punctuation is well managed.\n\nOccasional, non-systematic errors and inappropriacies occur, but have minimal impact on communication.\n--------------------\n\nScore: 7\nA variety of complex structures is used with some flexibility and accuracy.\n\nGrammar and punctuation are generally well controlled, and error-free sentences are frequent.\n\nA few errors in grammar may persist, but these do not impede communication.\n--------------------\n\nScore: 6\nA mix of simple and complex sentence forms is used but flexibility is limited.\n\nExamples of more complex structures are not marked by the same level of accuracy as in simple structures.\n\nErrors in grammar and punctuation occur, but rarely impede communication.\n--------------------\n\nScore: 5\nThe range of structures is limited and rather repetitive.\n\nAlthough complex sentences are attempted, they tend to be faulty, and the greatest accuracy is achieved on simple sentences.\n\nGrammatical errors may be frequent and cause some difficulty for the reader.\n\nPunctuation may be faulty.\n--------------------\n\nScore: 4\nA very limited range of structures is used.\n\n**Subordinate clauses are rare and simple sentences predominate**.\n\nSome structures are produced accurately but grammatical errors are frequent and may impede meaning.\n\nPunctuation is often faulty or inadequate.\n--------------------\n\nScore: 3\nSentence forms are attempted, but errors in grammar and punctuation predominate (except in memorised phrases or those taken from the input material). This prevents most meaning from coming through.\n\n**Length may be insufficient to provide evidence of control of sentence forms**.\n--------------------\n\nScore: 2\nThere is little or no evidence of sentence forms (except in memorised phrases).\n--------------------\n\nScore: 1\nResponses of 20 words or fewer are rated at Band 1.\n\n**No rateable language is evident**.\n--------------------\n\nScore: 0\nShould only be used where a candidate did not attend or attempt the question in any way, used a language other than English throughout, or where there is proof that a candidate\xe2\x80\x99s answer has been totally memorised.\n--------------------\n\n',
  'Lexical Resource':
    'Score: 9\nFull flexibility and precise use are widely evident.\n\nA wide range of vocabulary is used accurately and appropriately with very natural and sophisticated control of lexical features.\n\nMinor errors in spelling and word formation are extremely rare and have minimal impact on communication.\n--------------------\n\nScore: 8\nA wide resource is fluently and flexibly used to convey precise meanings.\n\nThere is skilful use of uncommon and/or idiomatic items when appropriate, despite occasional inaccuracies in word choice and collocation.\n\nOccasional errors in spelling and/or word formation may occur, but have minimal impact on communication.\n--------------------\n\nScore: 7\nThe resource is sufficient to allow some flexibility and precision.\n\nThere is some ability to use less common and/or idiomatic items.\n\nAn awareness of style and collocation is evident, though inappropriacies occur.\n\nThere are only a few errors in spelling and/or word formation and they do not detract from overall clarity.\n--------------------\n\nScore: 6\nThe resource is generally adequate and appropriate for the task.\n\nThe meaning is generally clear in spite of a rather restricted range or a lack of precision in word choice.\n\nIf the writer is a risk-taker, there will be a wider range of vocabulary used but higher degrees of inaccuracy or inappropriacy.\n\nThere are some errors in spelling and/or word formation, but these do not impede communication.\n--------------------\n\nScore: 5\nThe resource is limited but minimally adequate for the task.\n\nSimple vocabulary may be used accurately but the range does not permit much variation in expression.\n\nThere may be frequent lapses in the appropriacy of word choice and a lack of flexibility is apparent in frequent simplifications and/or repetitions.\n\nErrors in spelling and/or word formation may be noticeable and may cause some difficulty for the reader.\n--------------------\n\nScore: 4\nThe resource is limited and inadequate for or **unrelated to the task**. Vocabulary is basic and may be used repetitively.\n\nThere may be inappropriate use of lexical chunks (e.g. memorised phrases, formulaic language and/or language from the input material).\n\nInappropriate word choice and/or errors in word formation and/or in spelling may impede meaning.\n--------------------\n\nScore: 3\nThe resource is inadequate (which may be due to the response being significantly underlength). Possible over-dependence on input material or memorised language.\n\nControl of word choice and/or spelling is very limited, and errors predominate. These errors may severely impede meaning.\n--------------------\n\nScore: 2\nThe resource is extremely limited with few recognisable strings, apart from memorised phrases.\n\nThere is no apparent control of word formation and/or spelling.\n--------------------\n\nScore: 1\n**Responses of 20 words or fewer are rated at Band 1**.\n\nNo resource is apparent, except for a few isolated words.\n--------------------\n\nScore: 0\nShould only be used where a candidate did not attend or attempt the question in any way, used a language other than English throughout, or where there is proof that a candidate\xe2\x80\x99s answer has been totally memorised.\n--------------------\n\n',
  'Task Responce':
    'Score: 9\nThe prompt is appropriately addressed and explored in depth.\n\nA clear and fully developed position is presented which directly answers the question/s.\n\nIdeas are relevant, fully extended and well supported.\n\nAny lapses in content or support are extremely rare.\n--------------------\n\nScore: 8\nThe prompt is appropriately and sufficiently addressed.\n\nA clear and well-developed position is presented in response to the question/s.\n\nIdeas are relevant, well extended and supported.\n\nThere may be occasional omissions or lapses in content.\n--------------------\n\nScore: 7\nThe main parts of the prompt are appropriately addressed.\n\nA clear and developed position is presented.\n\nMain ideas are extended and supported but there may be a tendency to over-generalise or there may be a lack of focus and precision in supporting ideas/material.\n--------------------\n\nScore: 6\nThe main parts of the prompt are addressed (though some may be more fully covered than others).  An appropriate format is used.\n\nA position is presented that is directly relevant to the prompt, although the conclusions drawn may be unclear, unjustified or repetitive.\n\nMain ideas are relevant, but some may be insufficiently developed or may lack clarity, while some supporting arguments and evidence may be less relevant or inadequate\n--------------------\n\nScore: 5\nThe main parts of the prompt are **incompletely addressed**.  The format may be inappropriate in places.\n\nThe writer expresses a position, but the development is not always clear.\n\nSome main ideas are put forward, but they are limited and are not sufficiently developed and/or there may be irrelevant detail.\n\nThere may be some repetition.\n--------------------\n\nScore: 4\nThe prompt is tackled in a minimal way, or the answer is tangential, possibly due to some misunderstanding of the prompt.  **The format may be inappropriate**.\n\nA position is discernible, but the reader has to read carefully to find it.\n\nMain ideas are difficult to identify and such ideas that are identifiable may lack relevance, clarity and/or support.\n\nLarge parts of the response may be repetitive\n--------------------\n\nScore: 3\nNo part of the prompt is adequately addressed, or the prompt has been misunderstood.\n\nNo relevant position can be identified, and/or there is little direct response to the question/s.\n\nThere are few ideas, and these may be irrelevant or insufficiently developed.\n--------------------\n\nScore: 2\nThe content is barely related to the prompt.\n\nNo position can be identified.\n\nThere may be glimpses of one or two ideas without development.\n--------------------\n\nScore: 1\nResponses of 20 words or fewer are rated at Band 1.\n\nThe content is wholly unrelated to the prompt.\n\nAny copied rubric must be discounted.\n--------------------\n\nScore: 0\nShould only be used where a candidate did not attend or attempt the question in any way, used a language other than English throughout, or where there is proof that a candidate\xe2\x80\x99s answer has been totally memorised.\n--------------------\n\n',
};

function createPrompt(
  criteria_name: string,
  grading_rubric: string,
  writing_question: string,
  writing_answer: string,
) {
  return `
Given that IELTS writing task 2 is graded on ${criteria_name} according to the following rubric/scoring criteria:
<rubric>
A script/student answer must fully fit the positive features of the descriptor at a particular level/score. Bolded text indicates negative features that will limit a rating.
---------
${grading_rubric}
</rubric>

You are an IELTS examiner tasked with evaluating student's answer according to {key}

The student was given the following question:
<question>
${writing_question}
</question>

And the student answered as follows:
<answer>
${writing_answer}
</answer>

Grade the student's answer based on the provided rubric and give it a score
accordingly based on ${criteria_name} criteria.  And provide feedback referencing repecific
parts of the student's answer relevant to your grading.
`;
}
