import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
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

// HomePage is now lazy loaded
// import HomePage from './pages/home/HomePage'
// ─── Retry wrapper for dynamic imports (fixes production chunk errors) ───
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      return component
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assume chunk is missing due to a new deployment; hard reload the page
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        window.location.reload()
      }
      throw error
    }
  })

// ─── Secondary public pages: lazy loaded ────────────────────────────────────
const HomePage          = lazyWithRetry(() => import('./pages/home/HomePage'))
const LoginPage         = lazyWithRetry(() => import('./pages/auth/LoginPage'))
const SignupPage        = lazyWithRetry(() => import('./pages/auth/SignupPage'))
const JobsPage          = lazyWithRetry(() => import('./pages/jobs/JobsPage'))
const GigsPage          = lazyWithRetry(() => import('./pages/gigs/GigsPage'))
const ServicesPage      = lazyWithRetry(() => import('./pages/services/ServicesPage'))

// ─── Secondary public pages: lazy loaded ────────────────────────────────────
const ServiceDetailPage = lazyWithRetry(() => import('./pages/services/ServiceDetailPage'))
const JobDetailsPage    = lazyWithRetry(() => import('./pages/jobs/JobDetailsPage'))
const JobApplicantsPage = lazyWithRetry(() => import('./pages/jobs/JobApplicantsPage'))
const GigDetailsPage    = lazyWithRetry(() => import('./pages/gigs/GigDetailsPage'))
const BlogPage          = lazyWithRetry(() => import('./pages/blog/BlogPage'))
const GigApplicantsPage = lazyWithRetry(() => import('./pages/gigs/GigApplicantsPage'))
const FindWorkersPage   = lazyWithRetry(() => import('./pages/workers/FindWorkersPage'))
const WorkerProfilePage = lazyWithRetry(() => import('./pages/workers/WorkerProfilePage'))
const AboutPage         = lazyWithRetry(() => import('./pages/about/AboutPage'))
const ContactPage       = lazyWithRetry(() => import('./pages/contact/ContactPage'))
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/legal/PrivacyPolicyPage'))
const TermsPage         = lazyWithRetry(() => import('./pages/legal/TermsPage'))
const HelpCenterPage    = lazyWithRetry(() => import('./pages/support/HelpCenterPage'))
const FAQPage           = lazyWithRetry(() => import('./pages/support/FAQPage'))
const ReportIssuePage   = lazyWithRetry(() => import('./pages/support/ReportIssuePage'))
const FeedbackPage      = lazyWithRetry(() => import('./pages/support/FeedbackPage'))

// ─── Dashboard (auth-gated, always lazy) ────────────────────────────────────
const DashboardPage     = lazyWithRetry(() => import('./pages/dashboard/DashboardPage'))
const MyBookings        = lazyWithRetry(() => import('./pages/dashboard/MyBookings'))
const MyServices        = lazyWithRetry(() => import('./pages/dashboard/MyServices'))
const MyJobs            = lazyWithRetry(() => import('./pages/dashboard/MyJobs'))
const MyGigs            = lazyWithRetry(() => import('./pages/dashboard/MyGigs'))
const MyApplications    = lazyWithRetry(() => import('./pages/dashboard/MyApplications'))
const ProfilePage       = lazyWithRetry(() => import('./pages/profile/ProfilePage'))
const BookingsPage      = lazyWithRetry(() => import('./pages/bookings/BookingsPage'))
const BookingDetailPage = lazyWithRetry(() => import('./pages/bookings/BookingDetailPage'))
const PaymentsPage      = lazyWithRetry(() => import('./pages/payments/PaymentsPage'))
const PaymentGatewayPage = lazyWithRetry(() => import('./pages/payments/PaymentGatewayPage'))
const InvoicesPage      = lazyWithRetry(() => import('./pages/invoices/InvoicesPage'))
const InvoiceViewPage   = lazyWithRetry(() => import('./pages/invoices/InvoiceViewPage'))
const CreateServicePage = lazyWithRetry(() => import('./pages/services/CreateServicePage'))
const CreateJobPage     = lazyWithRetry(() => import('./pages/jobs/CreateJobPage'))
const CreateGigPage     = lazyWithRetry(() => import('./pages/gigs/CreateGigPage'))

// ─── Admin: heavy, always lazy ──────────────────────────────────────────────
const AdminDashboard  = lazyWithRetry(() => import('./pages/admin/AdminDashboard'))
const ManageUsers     = lazyWithRetry(() => import('./pages/admin/ManageUsers'))
const ManageServices  = lazyWithRetry(() => import('./pages/admin/ManageServices'))
const ManageBookings  = lazyWithRetry(() => import('./pages/admin/ManageBookings'))
const ManageJobs      = lazyWithRetry(() => import('./pages/admin/ManageJobs'))
const ManageGigs      = lazyWithRetry(() => import('./pages/admin/ManageGigs'))
const ManageReviews   = lazyWithRetry(() => import('./pages/admin/ManageReviews'))
const ManageReports   = lazyWithRetry(() => import('./pages/admin/ManageReports'))
const ManageContacts  = lazyWithRetry(() => import('./pages/admin/ManageContacts'))
const ManageFeedback  = lazyWithRetry(() => import('./pages/admin/ManageFeedback'))
const AdminSettings   = lazyWithRetry(() => import('./pages/admin/AdminSettings'))
const ManagePayments  = lazyWithRetry(() => import('./pages/admin/ManagePayments'))
const ManageInvoices  = lazyWithRetry(() => import('./pages/admin/ManageInvoices'))
const ManageBlogs     = lazyWithRetry(() => import('./pages/admin/ManageBlogs'))
const ManageOffers    = lazyWithRetry(() => import('./pages/admin/ManageOffers'))
const ManageAnnouncements = lazyWithRetry(() => import('./pages/admin/ManageAnnouncements'))

// ─── Misc ────────────────────────────────────────────────────────────────────
const ChatbotLauncher = lazyWithRetry(() => import('./components/ChatbotLauncher'))
const NotFoundPage    = lazyWithRetry(() => import('./pages/NotFoundPage'))
const MaintenancePage = lazyWithRetry(() => import('./pages/MaintenancePage'))

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
  const { settings } = useSettings()
  const { userProfile, loading: authLoading } = useAuth()
  const location = useLocation()

  // Removed global authLoading block to allow instant first paint.
  // Navbar and ProtectedRoute components handle auth loading state independently.

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

          <Route path="*" element={<SuspenseWrap><NotFoundPage /></SuspenseWrap>} />
        </Routes>

      <SuspenseWrap><ChatbotLauncher /></SuspenseWrap>
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
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
    </HelmetProvider>
  )
}
