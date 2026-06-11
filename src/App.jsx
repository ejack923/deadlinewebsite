import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import BundleBar from '@/components/BundleBar';
import MeansCalculator from '@/pages/MeansCalculator';
import WhatAidDoINeed from '@/pages/WhatAidDoINeed';
import FeesPayable from '@/pages/FeesPayable';
import VLATools from '@/pages/VLATools';
import LACWBilling from '@/pages/LACWBilling';
import TrainingGuide from '@/pages/TrainingGuide';
import BacksheetToCounsel from '@/pages/BacksheetToCounsel';
import TravelClaims from '@/pages/TravelClaims';
import ApplyForAid from '@/pages/ApplyForAid';
import StandAloneGuidelines from '@/pages/StandAloneGuidelines';
import InboxScanner from './InboxScanner.jsx';
import AuditMatter from '@/pages/AuditMatter';


const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const showBundleBar = location.pathname !== "/" && location.pathname !== "/Home" && location.pathname !== "/StandAloneGuidelines";

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/MeansCalculator" element={<LayoutWrapper currentPageName="MeansCalculator"><MeansCalculator /></LayoutWrapper>} />
      <Route path="/WhatAidDoINeed" element={<LayoutWrapper currentPageName="WhatAidDoINeed"><WhatAidDoINeed /></LayoutWrapper>} />
      <Route path="/FeesPayable" element={<LayoutWrapper currentPageName="FeesPayable"><FeesPayable /></LayoutWrapper>} />
      <Route path="/VLATools" element={<LayoutWrapper currentPageName="VLATools"><VLATools /></LayoutWrapper>} />
      <Route path="/LACWBilling" element={<LayoutWrapper currentPageName="LACWBilling"><LACWBilling /></LayoutWrapper>} />
      <Route path="/TrainingGuide" element={<LayoutWrapper currentPageName="TrainingGuide"><TrainingGuide /></LayoutWrapper>} />
      <Route path="/BacksheetToCounsel" element={<LayoutWrapper currentPageName="BacksheetToCounsel"><BacksheetToCounsel /></LayoutWrapper>} />
      <Route path="/TravelClaims" element={<LayoutWrapper currentPageName="TravelClaims"><TravelClaims /></LayoutWrapper>} />
      <Route path="/ApplyForAid" element={<LayoutWrapper currentPageName="ApplyForAid"><ApplyForAid /></LayoutWrapper>} />
      <Route path="/StandAloneGuidelines" element={<LayoutWrapper currentPageName="StandAloneGuidelines"><StandAloneGuidelines /></LayoutWrapper>} />
      <Route path="/jbl-portal" element={<StandAloneGuidelines />} />
      <Route path="/InboxScanner" element={<LayoutWrapper currentPageName="InboxScanner"><InboxScanner /></LayoutWrapper>} />
      <Route path="/AuditMatter/:id" element={<LayoutWrapper currentPageName="AuditMatter"><AuditMatter /></LayoutWrapper>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    {showBundleBar && <BundleBar />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
