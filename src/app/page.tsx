import CloakerGate from '@/components/CloakerGate';
import Preland1 from '@/components/Preland1';
import Preland2 from '@/components/Preland2';

export default function Home() {
  const prelandType = process.env.NEXT_PUBLIC_PRELAND || 'preland1';

  // Preland2 (estilo gov.br) não usa CloakerGate
  if (prelandType === 'preland2') {
    return <Preland2 />;
  }

  // Preland1 usa CloakerGate
  return (
    <CloakerGate>
      <Preland1 />
    </CloakerGate>
  );
}
