import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccountPage } from './pages/AccountPage'
import { CompanyFormPage } from './pages/CompanyFormPage'
import { AdminCompaniesPage } from './pages/AdminCompaniesPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminCatalogPage } from './pages/AdminCatalogPage'
import { AdminMarketplacePage } from './pages/AdminMarketplacePage'
import { StorePage } from './pages/StorePage'
import { CartPage } from './pages/CartPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderPage } from './pages/OrderPage'
import { SellPage } from './pages/SellPage'
import { RequireAuth, RequireRole } from './components/RouteGuards'
import { homePathFor } from './lib/roles'

function App() {
  const { isAuthenticated, roles } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={homePathFor(roles)} />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={homePathFor(roles)} />} />
      <Route
        path="/dashboard"
        element={
          <RequireRole role="reader">
            <DashboardPage />
          </RequireRole>
        }
      />
      <Route
        path="/account"
        element={
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/new"
        element={
          <RequireRole role="seller">
            <CompanyFormPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <RequireRole role="admin">
            <AdminCompaniesPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireRole role="admin">
            <AdminUsersPage />
          </RequireRole>
        }
      />
      <Route
        path="/admin/catalog"
        element={
          <RequireRole role="admin">
            <AdminCatalogPage />
          </RequireRole>
        }
      />
      <Route
        path="/store"
        element={
          <RequireRole role="buyer">
            <StorePage />
          </RequireRole>
        }
      />
      <Route
        path="/cart"
        element={
          <RequireRole role="buyer">
            <CartPage />
          </RequireRole>
        }
      />
      <Route
        path="/orders"
        element={
          <RequireRole role="buyer">
            <OrdersPage mode="purchases" />
          </RequireRole>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireRole role="buyer">
            <OrderPage />
          </RequireRole>
        }
      />
      <Route
        path="/sell"
        element={
          <RequireRole role="seller">
            <SellPage />
          </RequireRole>
        }
      />
      <Route
        path="/sales"
        element={
          <RequireRole role="seller">
            <OrdersPage mode="sales" />
          </RequireRole>
        }
      />
      <Route
        path="/admin/marketplace"
        element={
          <RequireRole role="admin">
            <AdminMarketplacePage />
          </RequireRole>
        }
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? homePathFor(roles) : '/login'} />} />
    </Routes>
  )
}

export default App
