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

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const SignupPage = lazy(() => import('./pages/auth/SignupPage'))
const HomePage = lazy(() => import('./pages/home/HomePage'))
const ServicesPage = lazy(() => import('./pages/services/ServicesPage'))
const ServiceDetailPage = lazy(() => import('./pages/services/ServiceDetailPage'))
const JobsPage = lazy(() => import('./pages/jobs/JobsPage'))
const JobDetailsPage = lazy(() => import('./pages/jobs/JobDetailsPage'))
const JobApplicantsPage = lazy(() => import('./pages/jobs/JobApplicantsPage'))
const GigsPage = lazy(() => import('./pages/gigs/GigsPage'))
const GigDetailsPage = lazy(() => import('./pages/gigs/GigDetailsPage'))
const FindWorkersPage = lazy(() => import('./pages/workers/FindWorkersPage'))
const AboutPage = lazy(() => import('./pages/about/AboutPage'))
const ContactPage = lazy(() => import('./pages/contact/ContactPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/legal/TermsPage'))
const HelpCenterPage = lazy(() => import('./pages/support/HelpCenterPage'))
const FAQPage = lazy(() => import('./pages/support/FAQPage'))
const ReportIssuePage = lazy(() => import('./pages/support/ReportIssuePage'))
const FeedbackPage = lazy(() => import('./pages/support/FeedbackPage'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const MyBookings = lazy(() => import('./pages/dashboard/MyBookings'))
const MyServices = lazy(() => import('./pages/dashboard/MyServices'))
const MyJobs = lazy(() => import('./pages/dashboard/MyJobs'))
const MyGigs = lazy(() => import('./pages/dashboard/MyGigs'))
const CreateServicePage = lazy(() => import('./pages/services/CreateServicePage'))
const CreateJobPage = lazy(() => import('./pages/jobs/CreateJobPage'))
const CreateGigPage = lazy(() => import('./pages/gigs/CreateGigPage'))
const BookingsPage = lazy(() => import('./pages/bookings/BookingsPage'))
const BookingDetailPage = lazy(() => import('./pages/bookings/BookingDetailPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const PaymentsPage = lazy(() => import('./pages/payments/PaymentsPage'))
const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage'))
const InvoiceViewPage = lazy(() => import('./pages/invoices/InvoiceViewPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const ManageServices = lazy(() => import('./pages/admin/ManageServices'))
const ManageBookings = lazy(() => import('./pages/admin/ManageBookings'))
const ManageJobs = lazy(() => import('./pages/admin/ManageJobs'))
const ManageGigs = lazy(() => import('./pages/admin/ManageGigs'))
const ManageReviews = lazy(() => import('./pages/admin/ManageReviews'))
const ManageReports = lazy(() => import('./pages/admin/ManageReports'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))
const Chatbot = lazy(() => import('./components/Chatbot'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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
