import { db } from '../../db';
import { useLive } from '../../ui';

/** Everything the snapshot can be built from, read live from the local database. */
export function useShareData() {
  return useLive(async () => {
    const [
      profile,
      medications,
      intakes,
      symptoms,
      diagnoses,
      exams,
      photos,
      documents,
      visitNoteItems,
      visits,
    ] = await Promise.all([
      db.profile.get(),
      db.medications.list(),
      db.intakes.list(),
      db.symptoms.list(),
      db.diagnoses.list(),
      db.exams.list(),
      db.photos.list(),
      db.documents.list(),
      db.visitNoteItems.list(),
      db.visits.list(),
    ]);
    return {
      profile,
      data: {
        medications,
        intakes,
        symptoms,
        diagnoses,
        exams,
        photos,
        documents: documents.map(({ file: _file, ...meta }) => meta),
        visitNoteItems,
        visits,
      },
    };
  });
}
