import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { BookOpen, User, Mail, Lock, BookMarked, TrendingUp, BookOpenCheck, X, Edit, Trash2 } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { booksService } from './services/books.service'
import type { Book, CreateBookRequest, Stats as StatsType } from './types/book'

// Página de Login
function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4"
      data-testid="login-page"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BookShelf</h1>
          <p className="text-white/80 text-sm">Sua biblioteca pessoal na nuvem</p>
        </div>
        
        {error && (
          <div 
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm text-center"
            data-testid="error-message"
            role="alert"
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                aria-label="E-mail para login"
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                aria-label="Senha para login"
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-purple-600 hover:bg-white/90 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            data-testid="login-button"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Não tem uma conta?{' '}
            <a href="/register" className="text-white font-semibold hover:underline transition-all">
              Cadastre-se grátis
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Página de Registro
function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(name, email, password)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 p-4"
      data-testid="register-page"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/80 text-sm">Comece sua biblioteca digital hoje</p>
        </div>
        
        {error && (
          <div 
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm text-center"
            data-testid="error-message"
            role="alert"
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
              Nome Completo
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="name-input"
                aria-label="Nome completo"
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="João Silva"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              E-mail
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                aria-label="E-mail para cadastro"
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              Senha
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-white/50 pointer-events-none" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                aria-label="Senha (mínimo 6 caracteres)"
                className="w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">Mínimo 6 caracteres</p>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-cyan-600 hover:bg-white/90 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            data-testid="register-button"
          >
            {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Já tem uma conta?{' '}
            <a href="/login" className="text-white font-semibold hover:underline transition-all">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Modal de Adicionar/Editar Livro
function BookModal({ 
  isOpen, 
  onClose, 
  bookToEdit, 
  onSuccess 
}: { 
  isOpen: boolean
  onClose: () => void
  bookToEdit?: Book | null
  onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [pages, setPages] = useState('')
  const [language, setLanguage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title)
      setAuthor(bookToEdit.author)
      setIsbn(bookToEdit.isbn || '')
      setPublisher(bookToEdit.publisher || '')
      setPublishedYear(bookToEdit.publishedYear?.toString() || '')
      setPages(bookToEdit.pages?.toString() || '')
      setLanguage(bookToEdit.language || '')
      setDescription(bookToEdit.description || '')
    } else {
      setTitle('')
      setAuthor('')
      setIsbn('')
      setPublisher('')
      setPublishedYear('')
      setPages('')
      setLanguage('')
      setDescription('')
    }
    setError('')
  }, [bookToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const bookData: CreateBookRequest = {
        title,
        author,
        ...(isbn && { isbn }),
        ...(publisher && { publisher }),
        ...(publishedYear && { publishedYear: parseInt(publishedYear) }),
        ...(pages && { pages: parseInt(pages) }),
        ...(language && { language }),
        ...(description && { description }),
      }

      if (bookToEdit) {
        await booksService.updateBook(bookToEdit.id, bookData)
      } else {
        await booksService.createBook(bookData)
      }
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao salvar livro')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" data-testid="book-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn my-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="modal-close-button"
          disabled={loading}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {bookToEdit ? 'Editar Livro' : 'Adicionar Livro'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Preencha os dados do livro</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 1984"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Autor *
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: George Orwell"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                id="isbn"
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 978-0451524935"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
                Editora
              </label>
              <input
                id="publisher"
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Companhia das Letras"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-1">
                Ano de Publicação
              </label>
              <input
                id="publishedYear"
                type="number"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 1949"
                min="1000"
                max="2100"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Páginas
              </label>
              <input
                id="pages"
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 328"
                min="1"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <input
                id="language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Português"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
              placeholder="Breve descrição do livro..."
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
              data-testid="cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={loading}
              data-testid="save-book-button"
            >
              {loading ? 'Salvando...' : bookToEdit ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal de confirmação de deleção
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  bookTitle,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  bookTitle: string
  loading: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="delete-confirm-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja excluir o livro "{bookTitle}"? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
            data-testid="cancel-delete-button"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading}
            data-testid="confirm-delete-button"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Dashboard
function DashboardPage() {
  const { logout, user } = useAuth()
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<StatsType['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [booksData, statsData] = await Promise.all([
        booksService.getBooks(),
        booksService.getStats()
      ])
      setBooks(booksData.books)
      setStats(statsData.stats)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddBook = () => {
    setBookToEdit(null)
    setShowAddBookModal(true)
  }

  const handleEditBook = (book: Book) => {
    setBookToEdit(book)
    setShowAddBookModal(true)
  }

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return

    try {
      setDeleteLoading(true)
      await booksService.deleteBook(bookToDelete.id)
      await loadData()
      setBookToDelete(null)
    } catch (err) {
      console.error('Erro ao deletar livro:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalSuccess = async () => {
    await loadData()
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      data-testid="dashboard-page"
    >
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BookShelf</h1>
              {user && <p className="text-xs text-gray-500">{user.name}</p>}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="hover:bg-gray-50"
          >
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name || 'bem-vindo'}!
          </h2>
          <p className="text-gray-600">Veja como está sua biblioteca hoje</p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div 
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
                data-testid="stats-total"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-medium">Total de Livros</p>
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                    <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{stats?.total || 0}</p>
                <p className="text-xs text-gray-500">livros na biblioteca</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-200 group cursor-pointer"
                data-testid="stats-to-read"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-blue-700 text-sm font-medium">Para Ler</p>
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <BookMarked className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-blue-900 mb-2">{stats?.byStatus.toRead || 0}</p>
                <p className="text-xs text-blue-600">Na fila de leitura</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-amber-200 group cursor-pointer"
                data-testid="stats-reading"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-amber-700 text-sm font-medium">Lendo</p>
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <BookOpenCheck className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-amber-900 mb-2">{stats?.byStatus.reading || 0}</p>
                <p className="text-xs text-amber-600">Em progresso</p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-green-200 group cursor-pointer"
                data-testid="stats-read"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-green-700 text-sm font-medium">Concluídos</p>
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-900 mb-2">{stats?.byStatus.read || 0}</p>
                <p className="text-xs text-green-600">Livros finalizados</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl text-white mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    {books.length === 0 ? 'Comece sua biblioteca' : 'Adicione mais livros'}
                  </h3>
                  <p className="text-white/90 mb-4">
                    {books.length === 0 
                      ? 'Adicione seu primeiro livro e comece a organizar suas leituras'
                      : 'Continue expandindo sua coleção de livros'
                    }
                  </p>
                  <Button 
                    onClick={handleAddBook}
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                    data-testid="add-book-button"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {books.length === 0 ? 'Adicionar Primeiro Livro' : 'Adicionar Livro'}
                  </Button>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {books.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum livro ainda
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Sua biblioteca está vazia. Que tal adicionar seu primeiro livro?
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Meus Livros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`book-item-${book.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            data-testid={`edit-book-${book.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(book)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            data-testid={`delete-book-${book.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {book.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {book.description}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {book.isbn && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            ISBN: {book.isbn}
                          </span>
                        )}
                        {book.publishedYear && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {book.publishedYear}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BookModal 
        isOpen={showAddBookModal} 
        onClose={() => {
          setShowAddBookModal(false)
          setBookToEdit(null)
        }}
        bookToEdit={bookToEdit}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteConfirm}
        bookTitle={bookToDelete?.title || ''}
        loading={deleteLoading}
      />
    </div>
  )
}

// App Principal
function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
