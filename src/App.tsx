import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { BookOpen, User, Mail, Lock, BookMarked, TrendingUp, BookOpenCheck, X } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'

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
      setError(err.message)
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
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm text-center">
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4"
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
              <BookMarked className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/80 text-sm">Comece sua jornada literária hoje</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm text-center">
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

// Modal de Adicionar Livro COMPLETO
function AddBookModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishedYear, setPublishedYear] = useState('')
  const [pages, setPages] = useState('')
  const [language, setLanguage] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Aqui você vai integrar com a API depois
    setTimeout(() => {
      alert(`Livro "${title}" por ${author} adicionado com sucesso!`)
      // Limpar formulário
      setTitle('')
      setAuthor('')
      setIsbn('')
      setPublisher('')
      setPublishedYear('')
      setPages('')
      setLanguage('')
      setDescription('')
      setLoading(false)
      onClose()
    }, 1000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative animate-fadeIn my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Adicionar Livro</h2>
          <p className="text-gray-600 text-sm mt-1">Preencha os dados do livro</p>
        </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Breve descrição do livro..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adicionando...' : 'Adicionar Livro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Página de Funcionalidades
function FeaturesPage() {
  const { logout, user } = useAuth()

  const features = [
    {
      icon: BookOpen,
      color: 'blue',
      title: 'Gerenciar Livros',
      description: 'Adicione, edite e organize todos os seus livros em um só lugar.',
      action: () => alert('Em breve: Funcionalidade de gerenciar livros!')
    },
    {
      icon: BookMarked,
      color: 'purple',
      title: 'Status de Leitura',
      description: 'Acompanhe o que está lendo, o que quer ler e o que já leu.',
      action: () => alert('Em breve: Filtro por status de leitura!')
    },
    {
      icon: TrendingUp,
      color: 'green',
      title: 'Estatísticas',
      description: 'Veja suas estatísticas de leitura e progresso ao longo do tempo.',
      action: () => alert('Em breve: Dashboard de estatísticas detalhadas!')
    },
    {
      icon: BookOpenCheck,
      color: 'amber',
      title: 'Avaliações',
      description: 'Avalie seus livros e mantenha suas opiniões registradas.',
      action: () => alert('Em breve: Sistema de avaliações!')
    },
    {
      icon: BookOpen,
      color: 'pink',
      title: 'Notas Pessoais',
      description: 'Adicione notas e comentários sobre cada livro.',
      action: () => alert('Em breve: Editor de notas!')
    },
    {
      icon: BookOpen,
      color: 'cyan',
      title: 'Busca e Filtros',
      description: 'Encontre rapidamente qualquer livro com busca avançada.',
      action: () => alert('Em breve: Busca avançada!')
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      amber: 'bg-amber-100 text-amber-600',
      pink: 'bg-pink-100 text-pink-600',
      cyan: 'bg-cyan-100 text-cyan-600'
    }
    return colors[color] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
            >
              Voltar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="hover:bg-gray-50"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades do BookShelf</h2>
          <p className="text-gray-600 text-lg">Tudo que você pode fazer com sua biblioteca pessoal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <button
                key={index}
                onClick={feature.action}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
              >
                <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                <p className="text-purple-600 text-sm mt-3 font-medium">Clique para saber mais →</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Dashboard
function DashboardPage() {
  const { logout, user } = useAuth()
  const [showAddBookModal, setShowAddBookModal] = useState(false)

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
            <p className="text-4xl font-bold text-gray-900 mb-2">0</p>
            <p className="text-xs text-gray-500">+0 este mês</p>
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
            <p className="text-4xl font-bold text-blue-900 mb-2">0</p>
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
            <p className="text-4xl font-bold text-amber-900 mb-2">0</p>
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
            <p className="text-4xl font-bold text-green-900 mb-2">0</p>
            <p className="text-xs text-green-600">Livros finalizados</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl text-white mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Comece sua biblioteca</h3>
              <p className="text-white/90 mb-4">
                Adicione seu primeiro livro e comece a organizar suas leituras
              </p>
              <Button 
                onClick={() => setShowAddBookModal(true)}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                data-testid="add-book-button"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Adicionar Primeiro Livro
              </Button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum livro ainda
            </h3>
            <p className="text-gray-600 mb-6">
              Sua biblioteca está vazia. Adicione livros para começar a organizar suas leituras e acompanhar seu progresso.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setShowAddBookModal(true)}>
                <BookOpen className="w-4 h-4 mr-2" />
                Adicionar Livro
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/features'}
              >
                Explorar Funcionalidades
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddBookModal 
        isOpen={showAddBookModal} 
        onClose={() => setShowAddBookModal(false)} 
      />
    </div>
  )
}

// Componente de Rota Protegida
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/features" 
        element={
          <ProtectedRoute>
            <FeaturesPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App