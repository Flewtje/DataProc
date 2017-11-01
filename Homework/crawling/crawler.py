# python3.6
# Sebastiaan Arendsen
# 

from bs4 import BeautifulSoup
import urllib.request
import csv
import os

# constants
TARGET_URL = 'http://www.imdb.com/chart/top'
BASE_URL = 'http://www.imdb.com/'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

def page_parser(data):
    URL = ''.join((BASE_URL, data['link']))
    html = urllib.request.urlopen(URL).read()
    soup = BeautifulSoup(html, 'html.parser')
    data['runtime'] = soup.find('div', 'subtext').time.string.strip()
    data['genre'] = soup.find('span', 'itemprop').string.strip()
    data['director'] = soup.find('div', 'summary_text').string.strip()

    return data

if __name__ == '__main__':

    # get soup for imdb top 250 page
    html = urllib.request.urlopen(TARGET_URL).read()
    soup = BeautifulSoup(html, 'html.parser')
    movies = []
    for movie in soup.find_all('td', 'titleColumn'):
        data = {}
        data['title'] = movie.a.string
        data['link'] = movie.a.get('href')
        data = page_parser(data)
        print(data)
        movies.append(data)