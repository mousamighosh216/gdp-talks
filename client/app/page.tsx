import Home from '../src/views/Home';
import { getHomeContent } from '../src/lib/server-api';

export const metadata = {
  title: 'GDP Talks | Students, companies and ideas',
  description: 'A hackathon where students and companies solve real problems together.',
};

export default async function Page() {
  const { journey, sectors } = await getHomeContent();
  return <Home journey={journey} sectors={sectors} />;
}
