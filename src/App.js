import { useRoutes } from 'react-router-dom';
import routes from './routes';
import Layout from './components/Layout';

function App() {
  var element = useRoutes(routes);
  return (
    <Layout>
      {element}
    </Layout>
  );
}

export default App;
