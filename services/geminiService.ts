import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Domain } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "The multiple-choice question. It can include markdown for formatting."
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of exactly 4 possible answers."
        },
        correctAnswer: {
          type: Type.STRING,
          description: "The correct answer, which must be an exact match to one of the strings from the 'options' array."
        },
        explanation: {
          type: Type.STRING,
          description: "A brief but thorough explanation of why the correct answer is right. It can include markdown for formatting."
        },
        hint: {
            type: Type.STRING,
            description: "A short, cryptic hint to guide the user towards the correct answer without giving it away."
        }
      },
      required: ["question", "options", "correctAnswer", "explanation", "hint"]
    }
};

const domainsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "The name of the legal domain."
            },
            description: {
                type: Type.STRING,
                description: "A brief, engaging description of the legal domain."
            },
            icon: {
                type: Type.STRING,
                description: "A single keyword for an icon. Must be one of: 'Constitution', 'Criminal', 'Civil', 'Gavel', 'Scales', 'Book'."
            },
            subdomains: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "A list of exactly 5 specific sub-topics within this domain."
            }
        },
        required: ["name", "description", "icon", "subdomains"]
    }
};


export const generateLegalDomains = async (): Promise<Domain[]> => {
    const prompt = `
        You are an expert curriculum designer for Indian law.
        Generate a list of 12 diverse legal domains in India for a quiz application.
        For each domain, provide:
        1. A clear 'name'.
        2. A brief 'description'.
        3. An 'icon' keyword. Choose one from: 'Constitution', 'Criminal', 'Civil', 'Gavel', 'Scales', 'Book'.
        4. A list of 5 specific 'subdomains' suitable for quiz topics.

        Return the result as a JSON array of objects, conforming to the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: domainsSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const domains = JSON.parse(jsonText) as Domain[];

        if (!Array.isArray(domains) || domains.length === 0) {
            throw new Error("AI did not return a valid array of domains.");
        }

        return domains;
    } catch (error) {
        console.error("Error generating legal domains:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to generate legal domains. The AI service responded with an error: ${errorMessage}`);
    }
};


export const generateQuizQuestions = async (topic: string, count: number, difficulty: string): Promise<Question[]> => {
  let prompt: string;

  if (topic === "Comprehensive CLAT LLM Mock Test") {
    prompt = `
      You are an expert CLAT LLM exam question setter.
      Your task is to generate a full-length, comprehensive mock test with ${count} multiple-choice questions.
      The test must cover a diverse and balanced range of subjects relevant to the CLAT LLM entrance exam, including Jurisprudence, Constitutional Law, Law of Torts, Criminal Law (IPC), Corporate Law, Contract Law, and International Law.
      The difficulty must be 'Expert' level, suitable for a competitive entrance exam. Questions should be complex, scenario-based, or involve niche areas of law and interpretation. Distractors should be subtle and plausible.

      Each question must have exactly 4 options. One of the options must be the correct answer.
      The 'correctAnswer' value must be an exact string match to one of the provided options.
      Provide a comprehensive explanation for each correct answer, referencing specific legal precedents and intricate points of law where applicable.
      Also provide a short, cryptic 'hint' for each question.

      Return the result as a JSON array of objects, conforming to the provided schema.
    `;
  } else {
    prompt = `
      You are an expert in Indian constitutional law and jurisprudence.
      Your task is to generate a challenging multiple-choice quiz based on Indian Supreme Court decisions and central statutes.
      
      The quiz difficulty must be '${difficulty}'. Please adhere to the following guidelines for this difficulty level:
      - **Beginner**: Questions should cover fundamental concepts and definitions. Options should have clear distractors. Explanations should be simple and direct.
      - **Intermediate**: Questions should require some analysis or application of concepts. Options might be more nuanced. Explanations should be more detailed, possibly citing relevant sections or case law.
      - **Expert**: Questions should be complex, scenario-based, or involve niche areas of law and interpretation. Distractors should be subtle and plausible. Explanations should be comprehensive, referencing specific legal precedents and intricate points of law.

      Generate ${count} multiple-choice questions about the following topic: "${topic}".

      Each question must have exactly 4 options. One of the options must be the correct answer.
      The 'correctAnswer' value must be an exact string match to one of the provided options.
      Provide a clear and concise explanation for each correct answer, tailored to the '${difficulty}' level.
      Also provide a short, cryptic 'hint' for each question that guides the user without giving away the answer.

      Return the result as a JSON array of objects, conforming to the provided schema.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    // A simple guard against empty or non-JSON responses
    if (!jsonText.startsWith('[')) {
        throw new Error("Received an invalid non-JSON response from the API.");
    }
    const parsedQuestions = JSON.parse(jsonText) as Question[];
    
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error("AI did not return a valid array of questions.");
    }

    // Filter out invalid questions to make the app more resilient to API errors
    const validQuestions = parsedQuestions.filter((q, index) => {
        const hasAllFields = q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer && q.explanation && q.hint;
        if (!hasAllFields) {
            console.warn(`Discarding question #${index + 1} due to missing fields.`, q);
            return false;
        }

        const isCorrectAnswerInOptions = q.options.includes(q.correctAnswer);
        if (!isCorrectAnswerInOptions) {
            console.warn(`Discarding question #${index + 1} ("${q.question}") because the correct answer ("${q.correctAnswer}") is not in the options array.`, q);
            return false;
        }

        return true;
    });

    if (validQuestions.length === 0) {
        throw new Error("The AI returned questions, but none of them were in the correct format. Please try again.");
    }

    return validQuestions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('400')) {
        throw new Error("There was a problem with the request to the AI service. Please check the prompt and configuration.");
    } else if (errorMessage.includes('500')) {
         throw new Error("The AI service is currently unavailable. Please try again later.");
    }
    throw new Error(`Failed to generate quiz questions: ${errorMessage}`);
  }
};