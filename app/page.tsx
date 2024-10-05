'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCcw, ExternalLink, Newspaper, Mic, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dateFormatter } from '@/lib/dateFormatter'

interface NewsArticle {
  title: string
  url: string
  description: string
  date?: string
}

interface Podcast {
  title: string
  url: string
  description: string
  channel: string
}

export default function NewsPodcastFetcher() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchNewsAndPodcasts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/news')
      if (!response.ok) {
        throw new Error('Erro na resposta da API')
      }
      const data = await response.json()
      setArticles(data.news || [])
      setPodcasts(data.podcasts || [])
    } catch (error) {
      console.error('Erro ao buscar notícias e podcasts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNewsAndPodcasts()

    const now = new Date()
    const nextExecution = new Date()
    nextExecution.setDate(now.getDate() + 1)
    nextExecution.setHours(8, 0, 0, 0)

    const timeUntilNextExecution = nextExecution.getTime() - now.getTime()

    const timer = setTimeout(fetchNewsAndPodcasts, timeUntilNextExecution)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1e1e1e] text-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1DB954] to-[#1ED760]">
            Descubra Agora
          </h1>
          <Button
            onClick={fetchNewsAndPodcasts}
            disabled={loading}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-all duration-300 rounded-full px-6 py-2"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </header>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-[#282828] rounded-full p-1">
            <TabsTrigger value="news" className="rounded-full data-[state=active]:bg-[#1DB954] data-[state=active]:text-black transition-all duration-300">
              <Newspaper className="mr-2 h-4 w-4" />
              Notícias
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="rounded-full data-[state=active]:bg-[#1DB954] data-[state=active]:text-black transition-all duration-300">
              <Mic className="mr-2 h-4 w-4" />
              Podcasts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-[#282828] border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4 bg-[#3e3e3e]" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full bg-[#3e3e3e] mb-2" />
                      <Skeleton className="h-4 w-5/6 bg-[#3e3e3e]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : articles.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, index) => (
                  <Card key={index} className="bg-[#282828] border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white group-hover:text-[#1DB954] transition-colors duration-300">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 line-clamp-3">{article.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{dateFormatter.format(new Date(article.date || ''))}</span>
                      <Button asChild variant="link" className="text-[#1DB954] hover:text-[#1ed760] transition-colors duration-300 p-0">
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          Ler mais <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-[#282828] border-none shadow-lg">
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-400">Nenhuma notícia encontrada.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="podcasts" className="space-y-6">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="bg-[#282828] border-none shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4 bg-[#3e3e3e]" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full bg-[#3e3e3e] mb-2" />
                      <Skeleton className="h-4 w-5/6 bg-[#3e3e3e]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : podcasts.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {podcasts.map((podcast, index) => (
                  <Card key={index} className="bg-[#282828] border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white group-hover:text-[#1DB954] transition-colors duration-300">{podcast.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 line-clamp-3">{podcast.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{podcast.channel}</span>
                      <Button asChild variant="link" className="text-[#1DB954] hover:text-[#1ed760] transition-colors duration-300 p-0">
                        <a href={podcast.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          Ouvir <ChevronRight className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-[#282828] border-none shadow-lg">
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-400">Nenhum podcast encontrado.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}