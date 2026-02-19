import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SelectRole from "./pages/SelectRole";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import CreateRequest from "./pages/CreateRequest";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Applications from "./pages/applications/Applications";

const OpportunityDetail = lazy(() => import("./pages/opportunities/OpportunityDetail"));
const ChatLayout = lazy(() => import("./pages/chat/ChatLayout"));
const BankIntegration = lazy(() => import("./pages/BankIntegration"));
const Credits = lazy(() => import("./pages/Credits"));
const HostOpportunities = lazy(() => import("./pages/HostOpportunities"));
const HostOpportunityDetail = lazy(() => import("./pages/opportunities/HostOpportunityDetail"));
const HostCandidates = lazy(() => import("./pages/opportunities/HostCandidates"));
const CandidateProfile = lazy(() => import("./pages/opportunities/CandidateProfile"));
const HostApplications = lazy(() => import("./pages/HostApplications"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Academy = lazy(() => import("./pages/academy/Academy"));
const CourseDetails = lazy(() => import("./pages/academy/CourseDetails"));
const WatchCourse = lazy(() => import("./pages/academy/WatchCourse"));
const QuizPage = lazy(() => import("./pages/academy/QuizPage"));
const CertificatePage = lazy(() => import("./pages/academy/CertificatePage"));
const CreateCourse = lazy(() => import("./pages/academy/CreateCourse"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth flow */}
            <Route path="/" element={<Index />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunities/:id" element={<Suspense fallback={null}><OpportunityDetail /></Suspense>} />
              <Route path="/viajante/oportunidades/:id" element={<Suspense fallback={null}><OpportunityDetail /></Suspense>} />
              <Route path="/requests/new" element={<CreateRequest />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/viajante/candidaturas" element={<Applications />} />
              <Route path="/academy" element={<Suspense fallback={null}><Academy /></Suspense>} />
              <Route path="/academy/courses/:id" element={<Suspense fallback={null}><CourseDetails /></Suspense>} />
              <Route path="/academy/courses/:id/watch" element={<Suspense fallback={null}><WatchCourse /></Suspense>} />
              <Route path="/academy/courses/:id/quiz" element={<Suspense fallback={null}><QuizPage /></Suspense>} />
              <Route path="/academy/courses/:id/certificate" element={<Suspense fallback={null}><CertificatePage /></Suspense>} />
              <Route path="/academy/create" element={<Suspense fallback={null}><CreateCourse /></Suspense>} />
              <Route path="/reviews" element={<Suspense fallback={null}><Reviews /></Suspense>} />
              <Route path="/anfitriao/candidaturas" element={<Suspense fallback={null}><HostApplications /></Suspense>} />
              <Route path="/community" element={<Navigate to="/dashboard" replace />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/requests" element={<Navigate to="/dashboard" replace />} />
              <Route path="/chat" element={<Suspense fallback={null}><ChatLayout /></Suspense>} />
              <Route path="/chat/:conversationId" element={<Suspense fallback={null}><ChatLayout /></Suspense>} />
              <Route path="/messages" element={<Navigate to="/chat" replace />} />
              <Route path="/bank-integration" element={<Suspense fallback={null}><BankIntegration /></Suspense>} />
              <Route path="/credits" element={<Suspense fallback={null}><Credits /></Suspense>} />
              <Route path="/anfitriao/oportunidades" element={<Suspense fallback={null}><HostOpportunities /></Suspense>} />
              <Route path="/anfitriao/oportunidades/:id" element={<Suspense fallback={null}><HostOpportunityDetail /></Suspense>} />
              <Route path="/anfitriao/oportunidades/:id/candidaturas" element={<Suspense fallback={null}><HostCandidates /></Suspense>} />
              <Route path="/anfitriao/oportunidades/:id/candidatos/:candidateId" element={<Suspense fallback={null}><CandidateProfile /></Suspense>} />
              <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
