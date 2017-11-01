# python3.6
# Sebastiaan Arendsen
# 

from bs4 import BeautifulSoup
import re
import urllib.request
import csv
import os

# constants
TARGET_URL = 'http://www.imdb.com/chart/top'
BASE_URL = 'http://www.imdb.com/'
OUTPUT_CSV = 'topmovies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

def retrieve_html(url):
    html = None
    while not html:
        try:
            html = urllib.request.urlopen(url, timeout=10).read()
        except:
            print("Download failed, will retry")


    return html

def page_parser(data):

    # create url for individual movie and parse with bs4

    # use standard python html parser
    soup = BeautifulSoup(retrieve_html(BASE_URL + data['link']), 'html.parser')
    
    # find data from movie page modify it and store it in a dictionary
    data['runtime'] = soup.find('time', attrs={'itemprop': 'duration'})\
    ['datetime'][2:-1]    
    sub_text = soup.find('div', 'subtext')
    
    # get the genres
    data['genre'] = []
    for el in sub_text('span', 'itemprop'):
        data['genre'].append(el.string.strip())
    data['genre'] = ';'.join(data['genre'])

    # find writers
    data['writer'] = []
    for el in soup('span', attrs={'itemprop': 'creator', 'itemtype':\
     'http://schema.org/Person'}):
        data['writer'].append(el.find('a').string.strip())
    data['writer'] = ';'.join(data['writer'])

    data['director'] = []
    for el in soup('span', attrs={'itemprop': 'director'}):
        data['director'].append(el.find('a').string.strip())
    data['director'] = ';'.join(data['director'])

    data['actor'] = []
    for el in soup('span', attrs={'itemprop': 'actors'}):
        data['actor'].append(el.find('span').string.strip())
    data['actor'] = ';'.join(data['actor'])

    rating_string = soup.find('div', class_='ratingValue').find('strong')\
    ['title']
    data['rating'] = rating_string[:3]

    # regular expression used to remove all non-digits from place 3 onwards
    data['voters'] = re.sub('[^0-9]', '', rating_string[3:])

    return data

def csv_storage(output_file, movies):
    writer = csv.writer(output_file)
    #for movie in movies:
    writer.writerow([movie['title'], movie['runtime'], movie['genre'], movie['director'], movie['writer'], movie['actor'], movie['rating'], movie['voters']])

if __name__ == '__main__':

    # get soup for imdb top 250 page
    html = urllib.request.urlopen(TARGET_URL).read()
    soup = BeautifulSoup(html, 'html.parser')
    movies = []
    with open(OUTPUT_CSV, 'w') as output_file:
        writer = csv.writer(output_file)
        writer.writerow(['Title', 'Runtime', 'Genre(s)', 'Director(s)', 'Writer(s)', 'Actor(s)', 'Rating', 'Number of ratings'])
    
    for i, movie in enumerate(soup('td', 'titleColumn')[:260]):
        data = {}
        data['title'] = movie.a.string
        data['link'] = movie.a.get('href')
        data = page_parser(data)
        print(i)
        with open(OUTPUT_CSV, 'a') as output_file:
            writer = csv.writer(output_file)
            writer.writerow([data['title'], data['runtime'], data['genre'],\
                data['director'], data['writer'], data['actor'], \
                data['rating'], data['voters']])