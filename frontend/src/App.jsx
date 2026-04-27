import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { DataCacheProvider } from './context/DataCacheContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'

import MainLayout from './layout/MainLayout'
import AuthLayout from './layout/AuthLayout'
import DashboardLayout from './layout/DashboardLayout'
import AdminLayout from './layout/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import { PageSkeleton } from './components/SkeletonLoader'

import HomePage from './pages/home/HomePage'

// ─── Secondary public pages: lazy loaded ────────────────────────────────────
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage        = lazy(() => import('./pages/auth/SignupPage'))
const JobsPage          = lazy(() => import('./pages/jobs/JobsPage'))
const GigsPage          = lazy(() => import('./pages/gigs/GigsPage'))
const ServicesPage      = lazy(() => import('./pages/services/ServicesPage'))

// ─── Secondary public pages: lazy loaded ────────────────────────────────────
const ServiceDetailPage = lazy(() => import('./pages/services/ServiceDetailPage'))
const JobDetailsPage    = lazy(() => import('./pages/jobs/JobDetailsPage'))
const JobApplicantsPage = lazy(() => import('./pages/jobs/JobApplicantsPage'))
const GigDetailsPage    = lazy(() => import('./pages/gigs/GigDetailsPage'))
const BlogPage          = lazy(() => import('./pages/blog/BlogPage'))
const GigApplicantsPage = lazy(() => import('./pages/gigs/GigApplicantsPage'))
const FindWorkersPage   = lazy(() => import('./pages/workers/FindWorkersPage'))
const WorkerProfilePage = lazy(() => import('./pages/workers/WorkerProfilePage'))
const AboutPage         = lazy(() => import('./pages/about/AboutPage'))
const ContactPage       = lazy(() => import('./pages/contact/ContactPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const TermsPage         = lazy(() => import('./pages/legal/TermsPage'))
const HelpCenterPage    = lazy(() => import('./pages/support/HelpCenterPage'))
const FAQPage           = lazy(() => import('./pages/support/FAQPage'))
const ReportIssuePage   = lazy(() => import('./pages/support/ReportIssuePage'))
const FeedbackPage      = lazy(() => import('./pages/support/FeedbackPage'))

// ─── Dashboard (auth-gated, always lazy) ────────────────────────────────────
const DashboardPage     = lazy(() => import('./pages/dashboard/DashboardPage'))
const MyBookings        = lazy(() => import('./pages/dashboard/MyBookings'))
const MyServices        = lazy(() => import('./pages/dashboard/MyServices'))
const MyJobs            = lazy(() => import('./pages/dashboard/MyJobs'))
const MyGigs            = lazy(() => import('./pages/dashboard/MyGigs'))
const MyApplications    = lazy(() => import('./pages/dashboard/MyApplications'))
const ProfilePage       = lazy(() => import('./pages/profile/ProfilePage'))
const BookingsPage      = lazy(() => import('./pages/bookings/BookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/bookings/BookingDetailPage'))
const PaymentsPage      = lazy(() => import('./pages/payments/PaymentsPage'))
const PaymentGatewayPage = lazy(() => import('./pages/payments/PaymentGatewayPage'))
const InvoicesPage      = lazy(() => import('./pages/invoices/InvoicesPage'))
const InvoiceViewPage   = lazy(() => import('./pages/invoices/InvoiceViewPage'))
const CreateServicePage = lazy(() => import('./pages/services/CreateServicePage'))
const CreateJobPage     = lazy(() => import('./pages/jobs/CreateJobPage'))
const CreateGigPage     = lazy(() => import('./pages/gigs/CreateGigPage'))

// ─── Admin: heavy, always lazy ──────────────────────────────────────────────
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'))
const ManageUsers     = lazy(() => import('./pages/admin/ManageUsers'))
const ManageServices  = lazy(() => import('./pages/admin/ManageServices'))
const ManageBookings  = lazy(() => import('./pages/admin/ManageBookings'))
const ManageJobs      = lazy(() => import('./pages/admin/ManageJobs'))
const ManageGigs      = lazy(() => import('./pages/admin/ManageGigs'))
const ManageReviews   = lazy(() => import('./pages/admin/ManageReviews'))
const ManageReports   = lazy(() => import('./pages/admin/ManageReports'))
const ManageContacts  = lazy(() => import('./pages/admin/ManageContacts'))
const ManageFeedback  = lazy(() => import('./pages/admin/ManageFeedback'))
const AdminSettings   = lazy(() => import('./pages/admin/AdminSettings'))
const ManagePayments  = lazy(() => import('./pages/admin/ManagePayments'))
const ManageInvoices  = lazy(() => import('./pages/admin/ManageInvoices'))
const ManageBlogs     = lazy(() => import('./pages/admin/ManageBlogs'))
const ManageOffers    = lazy(() => import('./pages/admin/ManageOffers'))
const ManageAnnouncements = lazy(() => import('./pages/admin/ManageAnnouncements'))

// ─── Misc ────────────────────────────────────────────────────────────────────
const Chatbot         = lazy(() => import('./components/Chatbot'))
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 }
  }
})

function SuspenseWrap({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

// Inner app handles dynamic settings routing
function AppInner() {
  const { settings, loading: settingsLoading } = useSettings()
  const { userProfile, loading: authLoading } = useAuth()
  const location = useLocation()

  // Wait for auth to resolve before checking admin status
  if (settingsLoading || authLoading) return <PageSkeleton />

  const isAdmin = userProfile?.user_type === 'admin'
  const isAuthRoute = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')

  // Block access to everything except auth routes if maintenance is active (unless Admin)
  if (settings.maintenanceMode && !isAdmin && !isAuthRoute) {
    return (
      <SuspenseWrap>
        <MaintenancePage />
      </SuspenseWrap>
    )
  }

  return (
    <>
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
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Public */}
          <Route element={<MainLayout />}>
            <Route path="/"                element={<HomePage />} />
            <Route path="/services"        element={<ServicesPage />} />
            <Route path="/services/:id"    element={<ServiceDetailPage />} />
            <Route path="/jobs"            element={<JobsPage />} />
            <Route path="/jobs/:id"        element={<JobDetailsPage />} />
            <Route path="/gigs"            element={<GigsPage />} />
            <Route path="/gigs/:id"        element={<GigDetailsPage />} />
            <Route path="/find-workers"    element={<FindWorkersPage />} />
            <Route path="/workers/:id"     element={<WorkerProfilePage />} />
            <Route path="/about"           element={<AboutPage />} />
            <Route path="/contact"         element={<ContactPage />} />
            <Route path="/privacy"         element={<PrivacyPolicyPage />} />
            <Route path="/terms"           element={<TermsPage />} />
            <Route path="/help"            element={<HelpCenterPage />} />
            <Route path="/faq"             element={<FAQPage />} />
            <Route path="/report-issue"    element={<ReportIssuePage />} />
            <Route path="/feedback"        element={<FeedbackPage />} />
            <Route path="/blog"            element={<BlogPage />} />
            <Route path="/blog/:slug"      element={<BlogPage />} />
          </Route>

          {/* Dashboard (authenticated) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/dashboard/bookings"     element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/dashboard/services"     element={<ProtectedRoute allowedRoles={['worker', 'admin']}><MyServices /></ProtectedRoute>} />
            <Route path="/dashboard/jobs"         element={<ProtectedRoute allowedRoles={['employer', 'admin']}><MyJobs /></ProtectedRoute>} />
            <Route path="/jobs/:id/applicants"    element={<ProtectedRoute allowedRoles={['employer', 'admin']}><JobApplicantsPage /></ProtectedRoute>} />
            <Route path="/dashboard/gigs"         element={<ProtectedRoute allowedRoles={['employer', 'admin']}><MyGigs /></ProtectedRoute>} />
            <Route path="/dashboard/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
            <Route path="/profile"                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/bookings"               element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/bookings/:id"           element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
            <Route path="/payments"               element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/payments/:bookingId"    element={<ProtectedRoute><PaymentGatewayPage /></ProtectedRoute>} />
            <Route path="/invoices"               element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
            <Route path="/invoices/:id"           element={<ProtectedRoute><InvoiceViewPage /></ProtectedRoute>} />
            <Route path="/services/create"        element={<ProtectedRoute allowedRoles={['worker', 'admin']}><CreateServicePage /></ProtectedRoute>} />
            <Route path="/jobs/create"            element={<ProtectedRoute allowedRoles={['employer', 'admin']}><CreateJobPage /></ProtectedRoute>} />
            <Route path="/jobs/:id/applicants"    element={<ProtectedRoute allowedRoles={['employer', 'admin']}><JobApplicantsPage /></ProtectedRoute>} />
            <Route path="/gigs/create"            element={<ProtectedRoute allowedRoles={['employer', 'admin']}><CreateGigPage /></ProtectedRoute>} />
            <Route path="/gigs/:id/applicants"    element={<ProtectedRoute allowedRoles={['employer', 'admin']}><GigApplicantsPage /></ProtectedRoute>} />
          </Route>

          {/* Admin */}
          <Route element={<AdminLayout />}>
            <Route path="/admin"               element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users"         element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/services"      element={<ProtectedRoute adminOnly><ManageServices /></ProtectedRoute>} />
            <Route path="/admin/bookings"      element={<ProtectedRoute adminOnly><ManageBookings /></ProtectedRoute>} />
            <Route path="/admin/jobs"          element={<ProtectedRoute adminOnly><ManageJobs /></ProtectedRoute>} />
            <Route path="/admin/gigs"          element={<ProtectedRoute adminOnly><ManageGigs /></ProtectedRoute>} />
            <Route path="/admin/reviews"       element={<ProtectedRoute adminOnly><ManageReviews /></ProtectedRoute>} />
            <Route path="/admin/reports"       element={<ProtectedRoute adminOnly><ManageReports /></ProtectedRoute>} />
            <Route path="/admin/contacts"      element={<ProtectedRoute adminOnly><ManageContacts /></ProtectedRoute>} />
            <Route path="/admin/feedback"      element={<ProtectedRoute adminOnly><ManageFeedback /></ProtectedRoute>} />
            <Route path="/admin/payments"      element={<ProtectedRoute adminOnly><ManagePayments /></ProtectedRoute>} />
            <Route path="/admin/invoices"      element={<ProtectedRoute adminOnly><ManageInvoices /></ProtectedRoute>} />
            <Route path="/admin/blogs"         element={<ProtectedRoute adminOnly><ManageBlogs /></ProtectedRoute>} />
            <Route path="/admin/offers"        element={<ProtectedRoute adminOnly><ManageOffers /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute adminOnly><ManageAnnouncements /></ProtectedRoute>} />
            <Route path="/admin/settings"      element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SuspenseWrap>

      <SuspenseWrap><Chatbot /></SuspenseWrap>
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <SettingsProvider>
        <BrowserRouter>
          <ThemeProvider>
          <AuthProvider>
            <DataCacheProvider>
            <CartProvider>
              <AppInner />
            </CartProvider>
            </DataCacheProvider>
          </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
