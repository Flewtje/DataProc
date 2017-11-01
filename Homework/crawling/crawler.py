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
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

def page_parser(data):

    # create url for individual movie and parse with bs4
    URL = BASE_URL + data['link']
    html = urllib.request.urlopen(URL).read()

    # use standard python html parser
    soup = BeautifulSoup(html, 'html.parser')
    
    # find data from movie page modify it and store it in a dictionary
    data['runtime'] = soup.find('time', attrs={'itemprop': 'duration'})['datetime'][2:-1]    
    sub_text = soup.find('div', 'subtext')
    
    # get the genres
    data['genre'] = []
    for el in sub_text('span', 'itemprop'):
        data['genre'].append(el.string.strip())
    data['genre'] = ';'.join(data['genre'])

    # find writers
    data['writer'] = []
    for el in soup('span', attrs={'itemprop': 'creator', 'itemtype': 'http://schema.org/Person'}):
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

    rating_string = soup.find('div', class_='ratingValue').find('strong')['title']
    data['rating'] = rating_string[:3]

    # regular expression used to remove all non digits from place 3 onwards
    data['voters'] = re.sub('[^0-9]', '', rating_string[3:])


    return data

if __name__ == '__main__':

    # get soup for imdb top 250 page
    html = urllib.request.urlopen(TARGET_URL).read()
    soup = BeautifulSoup(html, 'html.parser')
    movies = []
    for movie in soup('td', 'titleColumn'):
        data = {}
        data['title'] = movie.a.string
        data['link'] = movie.a.get('href')
        data = page_parser(data)
        print(data)
        movies.append(data)