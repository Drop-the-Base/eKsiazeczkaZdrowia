import type { Exam } from '@ez/shared';
import { db } from '../../db';
import { useLive } from '../../ui';
import { toExam, type ExamForm } from './exams.logic';

export function useExams() {
  return useLive(() => db.exams.list());
}

export function addExam(form: ExamForm): Promise<Exam> {
  return db.exams.add(toExam(form));
}

export function removeExam(id: string): Promise<void> {
  return db.exams.remove(id);
}
