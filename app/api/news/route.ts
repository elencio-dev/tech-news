import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

interface NewsArticle {
  title: string;
  url: string;
  description: string;
  source: string;
  date?: string;
  error?: string;
}

interface Podcast {
  title: string;
  url: string;
  description: string;
  channel: string;
  error?: string;
}

interface NewsSource {
  url: string;
  selector: string;
  titleSelector: string;
  descriptionSelector: string;
  linkSelector: string;
  dateSelector?: string;
}

const NEWS_SOURCES: NewsSource[] = [
  { url: 'https://www.bbc.com/portuguese', selector: '.gs-c-promo', titleSelector: '.gs-c-promo-heading__title', descriptionSelector: '.gs-c-promo-summary', linkSelector: 'a.gs-c-promo-heading' },
  { url: 'https://www.uol.com.br/tilt/', selector: '.thumb-content', titleSelector: '.thumb-title', descriptionSelector: '.thumb-subtitle', linkSelector: 'a' },
  { url: 'https://www.olhardigital.com.br/', selector: '.materia', titleSelector: '.title', descriptionSelector: '.desc', linkSelector: 'a' },
  { url: 'https://www.cnnbrasil.com.br/', selector: '.posts col__list', titleSelector: '.single-header__title', descriptionSelector: '.feed-post-description', linkSelector: 'a' },
  { url: 'https://g1.globo.com/', selector: '.feed-post-body', titleSelector: '.feed-post-link', descriptionSelector: '.feed-post-resumo', linkSelector: '.feed-post-link' },
  { url: 'https://www.tecmundo.com.br/', selector: '.tec--card__info', titleSelector: '.tec--card__title__link', descriptionSelector: '.tec--card__description', linkSelector: '.tec--card__title__link' },

  { url: 'https://www.opais.co.mz/', selector: '.news-item', titleSelector: '.news-title', descriptionSelector: '.news-summary', linkSelector: 'a' },
  { url: 'https://www.jornalnoticias.co.mz/', selector: '.post', titleSelector: '.post-title', descriptionSelector: '.post-excerpt', linkSelector: 'a' },
  { url: 'https://www.moz24h.co.mz/', selector: '.elementor-post', titleSelector: '.elementor-post__title', descriptionSelector: '.elementor-post__excerpt', linkSelector: 'a' },
  { url: 'https://cartamz.com/', selector: '.post-item', titleSelector: '.post-item-title', descriptionSelector: '.post-item-excerpt', linkSelector: 'a' },
  { url: 'http://www.tvm.co.mz/', selector: '.item', titleSelector: '.item-title', descriptionSelector: '.item-summary', linkSelector: 'a' }

];

export async function GET() {
  const allNews: NewsArticle[] = [];
  const errors: NewsArticle[] = [];
  const allPodcasts: Podcast[] = [];
  const podcastErrors: Podcast[] = [];

  await Promise.all([
    ...NEWS_SOURCES.map(async (source) => {
      try {
        const response = await axios.get(source.url);
        const html = response.data;
        const $ = cheerio.load(html);

        $(source.selector).each((index, element) => {
          const title = $(element).find(source.titleSelector).text().trim();
          let url = $(element).find(source.linkSelector).attr('href');
          const description = $(element).find(source.descriptionSelector).text().trim();
          const date = new Date().toISOString();

          if (title && url) {
            // Corrigir URLs relativas
            if (!url.startsWith('http')) {
              url = new URL(url, source.url).href;
            }
            allNews.push({ title, url, description, source: source.url, date });
          }
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(`Erro ao buscar notícias de ${source.url}:`, err);
          errors.push({ title: '', url: '', description: '', source: source.url, error: err.message });
        } else if (err instanceof Error) {
          console.error(`Erro ao buscar notícias de ${source.url}:`, err);
          errors.push({ title: '', url: '', description: '', source: source.url, error: err.message });
        } else {
          console.error(`Erro desconhecido ao buscar notícias de ${source.url}`);
          errors.push({ title: '', url: '', description: '', source: source.url, error: 'Erro desconhecido' });
        }
      }
    }),
    axios
      .get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: 'technology podcast',
          type: 'video',
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      })
      .then((response) => {
        const items = response.data.items;
        items.forEach((item: any) => {
          allPodcasts.push({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            description: item.snippet.description,
            channel: item.snippet.channelTitle,
          });
        });
      })
      .catch((err: unknown) => {
        if (axios.isAxiosError(err)) {
          console.error('Erro ao buscar podcasts do YouTube:', err);
          podcastErrors.push({ title: '', url: '', description: '', channel: '', error: err.message });
        } else if (err instanceof Error) {
          console.error('Erro ao buscar podcasts do YouTube:', err);
          podcastErrors.push({ title: '', url: '', description: '', channel: '', error: err.message });
        } else {
          console.error('Erro desconhecido ao buscar podcasts do YouTube');
          podcastErrors.push({ title: '', url: '', description: '', channel: '', error: 'Erro desconhecido' });
        }
      }),
  ]);

  // Intercalar as notícias e ordenar pelas mais recentes
  const sortedNews = allNews.sort((a, b) => (a.date && b.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0));

  if (sortedNews.length === 0 && allPodcasts.length === 0) {
    return NextResponse.json({ newsErrors: errors, podcastErrors }, { status: 204 }); // Nenhuma notícia ou podcast encontrada
  }

  return NextResponse.json({ news: sortedNews, newsErrors: errors, podcasts: allPodcasts, podcastErrors }, { status: 200 });
}