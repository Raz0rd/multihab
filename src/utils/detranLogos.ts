export const detranLogos: Record<string, string> = {
  AC: '/detrans/detran-ac.webp',
  AL: '/detrans/detran-al.jpg',
  AM: '/detrans/detran-am.svg',
  AP: '/detrans/detran-ap.png',
  BA: '/detrans/detran-ba.jpg',
  CE: '/detrans/detran-ce.png',
  DF: '/detrans/detran-df.jpg',
  ES: '/detrans/detran-es.jpg',
  GO: '/detrans/detran-go.png',
  MA: '/detrans/detran-ma.png',
  MG: '/detrans/detran-mg.jpg',
  MS: '/detrans/detran-ms.png',
  MT: '/detrans/detran-mt.jpg',
  PA: '/detrans/detran-pa.jpg',
  PB: '/detrans/detran-pb.png',
  PE: '/detrans/detran-pe.jpg',
  PI: '/detrans/detran-pi.jpg',
  PR: '/detrans/detran-pr.webp',
  RJ: '/detrans/detran-rj.jpg',
  RN: '/detrans/detran-rn.webp',
  RO: '/detrans/detran-ro.webp',
  RR: '/detrans/detran-rr.png',
  RS: '/detrans/detran-rs.gif',
  SC: '/detrans/detran-sc.png',
  SE: '/detrans/detran-se.webp',
  SP: '/detrans/detran-sp.jpg',
  TO: '/detrans/detran-to.jpg',
};

export function getDetranLogo(uf: string): string {
  const upperUf = uf?.toUpperCase() || 'SP';
  return detranLogos[upperUf] || '/detran-logo.png';
}
