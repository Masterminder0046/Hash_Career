import { Response, NextFunction } from 'express';
import { AuthRequest, InterviewType } from '../types';
import { Student } from '../models/Student';
import { Interview } from '../models/Interview';
import { generateInterviewQuestion, evaluateAnswer } from '../services/GeminiService';

const interviewQuestions: Record<string, string[]> = {
  hr: ['Tell me about yourself.', 'What are your strengths and weaknesses?', 'Where do you see yourself in 5 years?', 'Why do you want to work for our company?', 'Tell me about a time you faced a challenge.', 'How do you handle pressure?', 'Describe a situation where you worked in a team.', 'What is your greatest achievement?', 'Why should we hire you?', 'What are your salary expectations?'],
  technical: ['What is the difference between REST and SOAP?', 'Explain OOP concepts.', 'What is a database index?', 'Explain the MVC architecture.', 'What is version control and why is it important?', 'Explain the difference between HTTP and HTTPS.', 'What is an API?', 'What is the difference between SQL and NoSQL?', 'Explain caching.', 'What is load balancing?'],
  java: ['What is JVM?', 'Explain polymorphism in Java.', 'What is the difference between ArrayList and LinkedList?', 'What is garbage collection?', 'Explain the concept of inheritance.', 'What is an interface?', 'What is the difference between abstract class and interface?', 'Explain multithreading in Java.', 'What is the Collections framework?', 'What is exception handling?'],
  python: ['What are Python decorators?', 'Explain list comprehension.', 'What is the difference between a tuple and a list?', 'What is PEP 8?', 'Explain generators in Python.', 'What is the difference between deep copy and shallow copy?', 'Explain the Global Interpreter Lock (GIL).', 'What are Python modules?', 'How does memory management work in Python?', 'Explain lambda functions.'],
  react: ['What is React?', 'Explain the Virtual DOM.', 'What are React hooks?', 'What is the difference between state and props?', 'Explain the component lifecycle.', 'What is JSX?', 'What is Redux?', 'Explain the useEffect hook.', 'What are keys in React?', 'What is the Context API?'],
  node: ['What is Node.js?', 'Explain the event loop.', 'What is npm?', 'What are callbacks?', 'Explain Promises.', 'What is the difference between async/await and Promises?', 'What are streams in Node.js?', 'Explain middleware in Express.', 'What is clustering in Node.js?', 'How do you handle errors in Node.js?'],
  sql: ['What is SQL?', 'Explain JOINs in SQL.', 'What is normalization?', 'What is a primary key?', 'Explain the difference between WHERE and HAVING.', 'What is an index?', 'What is a subquery?', 'Explain GROUP BY.', 'What is a foreign key?', 'What is ACID?'],
  dbms: ['What is a database?', 'Explain the three schema architecture.', 'What is normalization?', 'What is a transaction?', 'Explain ACID properties.', 'What is indexing?', 'What is the difference between a primary key and unique key?', 'Explain the ER model.', 'What is data abstraction?', 'What is a functional dependency?'],
  os: ['What is an operating system?', 'Explain process vs thread.', 'What is deadlock?', 'Explain paging.', 'What is virtual memory?', 'Explain the difference between concurrency and parallelism.', 'What is a semaphore?', 'What is thrashing?', 'Explain CPU scheduling algorithms.', 'What is a system call?'],
  cn: ['What is a computer network?', 'Explain the OSI model.', 'What is TCP/IP?', 'What is a IP address?', 'Explain DNS.', 'What is HTTP?', 'What is a firewall?', 'Explain the difference between TCP and UDP.', 'What is a subnet mask?', 'What is a router?'],
  dsa: ['What is a data structure?', 'Explain arrays vs linked lists.', 'What is a stack?', 'What is a queue?', 'Explain binary search.', 'What is recursion?', 'Explain sorting algorithms.', 'What is a tree?', 'What is a graph?', 'Explain dynamic programming.'],
  aptitude: ['If a train travels at 60 km/h, how far will it travel in 2.5 hours?', 'What is the next number in the sequence: 2, 6, 12, 20, ?', 'A man buys a book for $50 and sells it for $60. What is the profit percentage?', 'What is the probability of getting a head in a coin toss?', 'If 5 workers can build a wall in 10 days, how many days will 10 workers take?', 'What is the compound interest on $1000 at 10% for 2 years?', 'If a:b = 2:3 and b:c = 4:5, find a:c.', 'What is the sum of angles in a triangle?', 'If log2(8) = x, what is x?', 'What is the area of a circle with radius 7?'],
};

export const startInterview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type } = req.body;

    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const questions = (interviewQuestions[type] || interviewQuestions.technical).slice(0, 5);

    const interview = await Interview.create({
      studentId: student._id,
      type: type || InterviewType.TECHNICAL,
      status: 'in_progress',
      questions: questions.map((q) => ({
        question: q,
        userAnswer: '',
        evaluation: {
          grammar: 0,
          technicalAccuracy: 0,
          confidence: 0,
          completeness: 0,
          communication: 0,
          feedback: '',
          suggestions: [],
        },
      })),
      overallScore: 0,
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        interviewId: interview._id,
        question: questions[0],
        questionNumber: 1,
        totalQuestions: questions.length,
        type,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { interviewId, answer, questionIndex } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (questionIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    interview.questions[questionIndex].userAnswer = answer;

    const evaluation = await evaluateAnswer(
      interview.questions[questionIndex].question,
      answer,
      interview.type
    );

    interview.questions[questionIndex].evaluation = {
      grammar: evaluation.grammar || 7,
      technicalAccuracy: evaluation.technicalAccuracy || 7,
      confidence: evaluation.confidence || 7,
      completeness: evaluation.completeness || 7,
      communication: evaluation.communication || 7,
      feedback: evaluation.feedback || 'Good answer. Consider adding more detail.',
      suggestions: evaluation.suggestions || ['Use more specific examples'],
    };

    const isLastQuestion = questionIndex >= interview.questions.length - 1;

    if (isLastQuestion) {
      const totalScore = interview.questions.reduce((sum, q) => {
        const ev = q.evaluation;
        return sum + (ev.grammar + ev.technicalAccuracy + ev.confidence + ev.completeness + ev.communication) / 5;
      }, 0);
      interview.overallScore = Math.round(totalScore / interview.questions.length);
      interview.status = 'completed';
      interview.completedAt = new Date();
      interview.duration = Math.round((Date.now() - interview.startedAt.getTime()) / 60000);

      interview.report = generateReport(interview);
      await interview.save();

      return res.json({
        success: true,
        data: {
          completed: true,
          evaluation: interview.questions[questionIndex].evaluation,
          overallScore: interview.overallScore,
          report: interview.report,
        },
      });
    }

    await interview.save();

    res.json({
      success: true,
      data: {
        completed: false,
        evaluation: interview.questions[questionIndex].evaluation,
        nextQuestion: interview.questions[questionIndex + 1].question,
        nextQuestionNumber: questionIndex + 2,
        totalQuestions: interview.questions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const interviews = await Interview.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

const generateReport = (interview: any) => {
  const scores = interview.questions.map((q: any) => ({
    technical: q.evaluation.technicalAccuracy,
    communication: q.evaluation.communication,
    confidence: q.evaluation.confidence,
  }));

  const avgTechnical = scores.reduce((s: number, sc: any) => s + sc.technical, 0) / scores.length;
  const avgComm = scores.reduce((s: number, sc: any) => s + sc.communication, 0) / scores.length;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (avgTechnical >= 7) strengths.push('Strong technical knowledge');
  else weaknesses.push('Technical knowledge needs improvement');

  if (avgComm >= 7) strengths.push('Good communication skills');
  else weaknesses.push('Communication skills need improvement');

  if (interview.overallScore >= 7) strengths.push('Overall good interview performance');
  else weaknesses.push('Need to improve overall interview skills');

  recommendations.push('Practice more mock interviews');
  recommendations.push('Work on structuring answers using STAR method');
  recommendations.push('Review technical concepts regularly');

  return {
    strengths,
    weaknesses,
    recommendations,
    overallFeedback: `Interview completed with overall score of ${interview.overallScore}/10. ${strengths.length > 0 ? 'Key strengths: ' + strengths.join(', ') : ''} ${weaknesses.length > 0 ? 'Areas to improve: ' + weaknesses.join(', ') : ''}`,
  };
};
