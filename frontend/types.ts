
export enum UserRole {
  PENGAWAS = 'pengawas',
  SISWA = 'siswa'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  class?: string;
}

export enum ExamType {
  TUGAS = 'TUGAS',
  UTS = 'UTS',
  UAS = 'UAS'
}

export enum QuestionType {
  PG = 'Pilihan Ganda',
  ESSAY = 'Essay'
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  subject?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  subject: string;
  teacherId: string;
  className: string;
  startTime: string;
  durationMinutes: number;
  isActive: boolean;
  isCameraRequired: boolean;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  studentAnswer: string;
  score: number;
  maxScore: number;
  comment?: string;
  studentAttachmentUrl?: string;
  studentAttachmentName?: string;
  studentAttachmentType?: string;
}

export interface ProctoringStats {
  tabSwitchCount: number;
  noFaceCount: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  status: 'SUBMITTED' | 'GRADED';
  submittedAt: string;
  answers: Answer[];
  totalScore: number;
  proctoringStats?: ProctoringStats; // Persisted proctoring data
}

export interface StudentActivity {
  studentId: string;
  examId: string;
  status: 'ONLINE' | 'OFFLINE' | 'SUSPICIOUS' | 'FINISHED';
  violationReason?: string;
  cameraEnabled: boolean;
  tabSwitchCount: number;
  noFaceCount: number; // Track absences from camera
  lastSeen: string;
}

export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
}

export interface Meeting {
  id: string;
  subject: string;
  className: string;
  date: string;
  topic: string;
  attendance: AttendanceRecord[];
}
