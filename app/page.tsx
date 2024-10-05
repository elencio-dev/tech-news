'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw, ExternalLink } from 'lucide-react'

interface NewsArticle {
  title: string
  url: string
  description: string
}

export default function NewsFetcher() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/news')
      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }
      const data = await response.json()
      setArticles(data)
    } catch (error) {
      console.error('Erro ao buscar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()

    const now = new Date()
    const nextExecution = new Date()
    nextExecution.setDate(now.getDate() + 1)
    nextExecution.setHours(8, 0, 0, 0)

    const timeUntilNextExecution = nextExecution.getTime() - now.getTime()

    const timer = setTimeout(fetchNews, timeUntilNextExecution)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#1DB954]">Notícias de Hoje</h1>
          <Button 
            onClick={fetchNews} 
            disabled={loading}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-colors duration-300"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </header>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-[#1e1e1e] border-[#2e2e2e]">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4 bg-[#2e2e2e]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full bg-[#2e2e2e] mb-2" />
                  <Skeleton className="h-4 w-5/6 bg-[#2e2e2e]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <Card key={index} className="bg-[#1e1e1e] border-[#2e2e2e] hover:bg-[#252525] transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#1DB954]">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">{article.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="link" className="text-[#1DB954] hover:text-[#1ed760] transition-colors duration-300">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Leia mais <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1e1e1e] border-[#2e2e2e]">
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-400">Nenhuma notícia encontrada.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}