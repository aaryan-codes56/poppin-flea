// Old login URL — everything now lives at /admin.
export function getServerSideProps() {
  return { redirect: { destination: '/admin', permanent: false } };
}

export default function LegacyLogin() {
  return null;
}
