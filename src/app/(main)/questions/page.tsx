'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useQuestionStore } from '@/stores/question-store';
import { QuestionTable } from '@/components/questions/question-table';
import { QuestionFormDialog } from '@/components/questions/question-form-dialog';
import { ImportExport } from '@/components/shared/import-export';
import { EmptyState } from '@/components/shared/empty-state';
import { Question } from '@/types/question';

export default function QuestionsPage() {
  const { questions, hydrated, hydrate, addQuestion, updateQuestion, deleteQuestion, setQuestions } =
    useQuestionStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSave = (q: Question) => {
    if (editing) {
      updateQuestion(q.id, q);
    } else {
      addQuestion(q);
    }
    setEditing(null);
  };

  const handleEdit = (q: Question) => {
    setEditing(q);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  if (!hydrated) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Step 2</span>
            <h2 className="text-2xl font-bold">Questions</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create the question bank. Each question will be used as a <strong>step</strong> in policy flows.
            Types: boolean (yes/no), select (dropdown), text, or number.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExport
            data={questions}
            onImport={setQuestions}
            label="JSON"
          />
          <Button onClick={handleNew}>+ New Question</Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Create your first question to start building policies."
          action={<Button onClick={handleNew}>+ New Question</Button>}
        />
      ) : (
        <>
          <QuestionTable
            questions={questions}
            onEdit={handleEdit}
            onDelete={deleteQuestion}
          />
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            Next step:
            <Button variant="outline" size="sm" asChild>
              <Link href="/policies">3. Policies &rarr;</Link>
            </Button>
          </div>
        </>
      )}

      <QuestionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        question={editing}
        onSave={handleSave}
      />
    </div>
  );
}
