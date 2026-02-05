
import { User, UserRole, Exam, ExamType, QuestionType, ExamResult } from './types';

export const MOCK_USERS: User[] = [
  { id: '4', name: 'Rizky Ramadhan', role: UserRole.SISWA, email: 'rizky@edu.com', class: 'XII-IPA-1' },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-1',
    title: 'UTS Bahasa Inggris Semester Ganjil',
    type: ExamType.UTS,
    subject: 'Bahasa Inggris',
    teacherId: '1',
    className: 'XII-IPA-1',
    startTime: '2023-10-25T08:00:00',
    durationMinutes: 90,
    isActive: true,
    isCameraRequired: true,
    questions: [
      {
        id: 'q1',
        type: QuestionType.PG,
        text: 'Choose the correct verb form: She ___ to the market yesterday.',
        options: ['go', 'went', 'gone', 'going'],
        correctAnswer: 'went',
        points: 50
      },
      {
        id: 'q2',
        type: QuestionType.ESSAY,
        text: 'Describe your daily routine in 5 sentences.',
        points: 50
      }
    ]
  }
];

export const MOCK_RESULTS: ExamResult[] = [
  {
    id: 'res-1',
    examId: 'ex-1',
    studentId: '4',
    studentName: 'Rizky Ramadhan',
    status: 'SUBMITTED',
    submittedAt: '2023-10-25T10:00:00',
    totalScore: 50,
    proctoringStats: {
      tabSwitchCount: 2,
      noFaceCount: 1
    },
    answers: [
      {
        questionId: 'q1',
        studentAnswer: 'went',
        score: 50,
        maxScore: 50
      },
      {
        questionId: 'q2',
        studentAnswer: 'I wake up at 6 AM. I take a shower and eat breakfast. Then I go to school. After school I play football. I study at night before sleeping.',
        score: 0,
        maxScore: 50
      }
    ]
  }
];
