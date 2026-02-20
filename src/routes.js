import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import FinancePage from './pages/FinancePage';
import MarketPage from './pages/MarketPage';
import ResultPage from './pages/ResultPage';

var routes = [
    { path: '/', element: <LandingPage /> },
    { path: '/setup', element: <SetupPage /> },
    { path: '/market', element: <MarketPage /> },
    { path: '/finance', element: <FinancePage /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/result', element: <ResultPage /> }
];

export default routes;
