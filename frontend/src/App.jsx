import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { DataCacheProvider } from './context/DataCacheContext'

import MainLayout from './layout/MainLayout'
import AuthLayout from './layout/AuthLayout'
import DashboardLayout from './layout/DashboardLayout'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { PageSkeleton } from './components/SkeletonLoader'
import HomePage from './pages/home/HomePage'

// Load core pages directly for instant navigation
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ServicesPage from './pages/services/ServicesPage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'
import JobsPage from './pages/jobs/JobsPage'
import JobDetailsPage from './pages/jobs/JobDetailsPage'
import JobApplicantsPage from './pages/jobs/JobApplicantsPage'
import GigsPage from './pages/gigs/GigsPage'
import GigDetailsPage from './pages/gigs/GigDetailsPage'
import GigApplicantsPage from './pages/gigs/GigApplicantsPage'
import FindWorkersPage from './pages/workers/FindWorkersPage'
import WorkerProfilePage from './pages/workers/WorkerProfilePage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MyBookings from './pages/dashboard/MyBookings'
import MyServices from './pages/dashboard/MyServices'
import MyJobs from './pages/dashboard/MyJobs'
import MyGigs from './pages/dashboard/MyGigs'

import AboutPage from './pages/about/AboutPage'
import ContactPage from './pages/contact/ContactPage'
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage'
import TermsPage from './pages/legal/TermsPage'
import HelpCenterPage from './pages/support/HelpCenterPage'
import FAQPage from './pages/support/FAQPage'
import ReportIssuePage from './pages/support/ReportIssuePage'
import FeedbackPage from './pages/support/FeedbackPage'
import CreateServicePage from './pages/services/CreateServicePage'
import CreateJobPage from './pages/jobs/CreateJobPage'
import CreateGigPage from './pages/gigs/CreateGigPage'
import BookingsPage from './pages/bookings/BookingsPage'
import BookingDetailPage from './pages/bookings/BookingDetailPage'
import ProfilePage from './pages/profile/ProfilePage'
import PaymentsPage from './pages/payments/PaymentsPage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import InvoiceViewPage from './pages/invoices/InvoiceViewPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageServices from './pages/admin/ManageServices'
import ManageBookings from './pages/admin/ManageBookings'
import ManageJobs from './pages/admin/ManageJobs'
import ManageGigs from './pages/admin/ManageGigs'
import ManageReviews from './pages/admin/ManageReviews'
import ManageReports from './pages/admin/ManageReports'
import AdminSettings from './pages/admin/AdminSettings'
import Chatbot from './components/Chatbot'
import NotFoundPage from './pages/NotFoundPage'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } })

function SuspenseWrap({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <ThemeProvider>
        <AuthProvider>
          <DataCacheProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{
              duration: 3500,
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
              success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } }
            }} />

            <ScrollToTop />

            <SuspenseWrap>
              <Routes>
                {/* Auth */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Public */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:id" element={<ServiceDetailPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailsPage />} />
                  <Route path="/gigs" element={<GigsPage />} />
                  <Route path="/gigs/:id" element={<GigDetailsPage />} />
                  <Route path="/find-workers" element={<FindWorkersPage />} />
                  <Route path="/workers/:id" element={<WorkerProfilePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/report-issue" element={<ReportIssuePage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                </Route>

                {/* Dashboard (authenticated) */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/dashboard/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                  <Route path="/dashboard/services" element={<ProtectedRoute allowedRoles={['worker', 'admin']}><MyServices /></ProtectedRoute>} />
                  <Route path="/dashboard/jobs" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><MyJobs /></ProtectedRoute>} />
                  <Route path="/dashboard/gigs" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><MyGigs /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                  <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
                  <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
                  <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                  <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceViewPage /></ProtectedRoute>} />
                  <Route path="/services/create" element={<ProtectedRoute allowedRoles={['worker', 'admin']}><CreateServicePage /></ProtectedRoute>} />
                  <Route path="/jobs/create" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><CreateJobPage /></ProtectedRoute>} />
                  <Route path="/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><JobApplicantsPage /></ProtectedRoute>} />
                  <Route path="/gigs/create" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><CreateGigPage /></ProtectedRoute>} />
                  <Route path="/gigs/:id/applicants" element={<ProtectedRoute allowedRoles={['employer', 'admin']}><GigApplicantsPage /></ProtectedRoute>} />
                </Route>

                {/* Admin */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
                  <Route path="/admin/services" element={<ProtectedRoute adminOnly><ManageServices /></ProtectedRoute>} />
                  <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><ManageBookings /></ProtectedRoute>} />
                  <Route path="/admin/jobs" element={<ProtectedRoute adminOnly><ManageJobs /></ProtectedRoute>} />
                  <Route path="/admin/gigs" element={<ProtectedRoute adminOnly><ManageGigs /></ProtectedRoute>} />
                  <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><ManageReviews /></ProtectedRoute>} />
                  <Route path="/admin/reports" element={<ProtectedRoute adminOnly><ManageReports /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </SuspenseWrap>

            <SuspenseWrap><Chatbot /></SuspenseWrap>
          </CartProvider>
          </DataCacheProvider>
        </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
