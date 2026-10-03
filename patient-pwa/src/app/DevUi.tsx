import { useState } from 'react';
import {
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  List,
  ListItem,
  LoadingState,
  MicButton,
  PageHeader,
} from '../ui';
import { DrugPicker } from '../features/drugs';

/** Podgląd komponentów `ui/` pod `/dev/ui` (bez zakładki w nawigacji). */
export function DevUi() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [selected, setSelected] = useState('30');
  const [picked, setPicked] = useState('');

  return (
    <>
      <PageHeader title="Komponenty UI" action={<Button variant="ghost">Akcja</Button>} />
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          padding: '0 var(--space-4) var(--space-5)',
        }}
      >
        <Card>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Button>Główny</Button>
            <Button variant="secondary">Drugi</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Usuń</Button>
            <Button disabled>Wyłączony</Button>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {['7', '30', '90'].map((d) => (
            <Chip key={d} selected={selected === d} onClick={() => setSelected(d)}>
              {d} dni
            </Chip>
          ))}
          <Chip dotColor="var(--color-rx)">Na receptę</Chip>
          <Chip dotColor="var(--color-otc)">Bez recepty</Chip>
          <Chip dotColor="var(--color-supplement)">Suplementy i zioła</Chip>
        </div>

        <Card>
          <DrugPicker
            onSelect={({ drug, name }) =>
              setPicked(
                drug ? `${drug.name} ${drug.strength} (${drug.atcCode})` : `${name} (spoza RPL)`,
              )
            }
          />
          {picked && <p>Wybrano: {picked}</p>}
        </Card>

        <List>
          <ListItem title="Ibuprom 200 mg" subtitle="doraźnie" onClick={() => setSheetOpen(true)} />
          <ListItem title="Suplement z grzybów" subtitle="1× dziennie · od 03.2026" trailing="›" />
        </List>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MicButton listening={listening} onClick={() => setListening((l) => !l)} />
        </div>

        <Card>
          <EmptyState title="Brak wpisów">Dodaj pierwszy objaw.</EmptyState>
        </Card>
        <Card>
          <LoadingState />
        </Card>
        <Card>
          <ErrorState message="Nie udało się wczytać danych." onRetry={() => undefined} />
        </Card>

        <Button block onClick={() => setSheetOpen(true)}>
          Otwórz arkusz
        </Button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Arkusz od dołu">
        <p>Treść arkusza.</p>
        <Button block onClick={() => setSheetOpen(false)}>
          Zamknij
        </Button>
      </BottomSheet>
    </>
  );
}
