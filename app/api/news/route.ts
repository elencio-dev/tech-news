import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';


interface NewsArticle {
  title: string;
  url: string;
  description: string;
}

interface NewsSource {
  url: string;
  selector: string;
  titleSelector: string;
  descriptionSelector: string;
  linkSelector: string;
}

const NEWS_SOURCES: NewsSource[] = [
  { url: 'https://g1.globo.com/', selector: '.feed-post-body', titleSelector: '.feed-post-link', descriptionSelector: '.feed-post-resumo', linkSelector: '.feed-post-link' },
  { url: 'https://www.tecmundo.com.br/', selector: '.tec--card__info', titleSelector: '.tec--card__title__link', descriptionSelector: '.tec--card__description', linkSelector: '.tec--card__title__link' },
  { url: 'https://www.bbc.com/portuguese', selector: '.gs-c-promo', titleSelector: '.gs-c-promo-heading__title', descriptionSelector: '.gs-c-promo-summary', linkSelector: 'a.gs-c-promo-heading' }
];

export async function GET() {
    try {
      const allNews: NewsArticle[] = [];
  
      for (const source of NEWS_SOURCES) {
        try {
          const response = await axios.get(source.url);
          const html = response.data;
          const $ = cheerio.load(html);
  
          $(source.selector).each((index, element) => {
            const title = $(element).find(source.titleSelector).text().trim();
            let url = $(element).find(source.linkSelector).attr('href');
            const description = $(element).find(source.descriptionSelector).text().trim();
  
            if (title && url) {
              if (!url.startsWith('http')) {
                url = new URL(url, source.url).href;
              }
              allNews.push({ title, url, description });
            }
          });
        } catch (err) {
          console.error(`Erro ao buscar notícias de ${source.url}:`, err);
        }
      }
      if (allNews.length === 0) {
        return NextResponse.json({}, { status: 204 }); // Nenhuma notícia encontrada
      }
  
      return NextResponse.json(allNews, { status: 200 });
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      return NextResponse.json({ error: 'Erro ao buscar notícias' }, { status: 500 });
    }
  }