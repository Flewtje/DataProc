# python3.6
# Sebastiaan Arendsen
# 

# using bs4 instead of patterns as it allows python3
from bs4 import BeautifulSoup
import re
import urllib.request
import csv
import os

# constants
TARGET_URL = 'http://www.imdb.com/chart/top'
BASE_URL = 'http://www.imdb.com/'
OUTPUT_CSV = 'topmovies.csv'

def retrieve_html(url):
    """
    Function created to retrieve a url using urllib. Problems might arise when
    page takes to long to react, so timeout is build in with an error message.
    """
    html = None
    while not html:
        try:
            html = urllib.request.urlopen(url, timeout=10).read()
        except:
            print('Download failed, will retry.')

    return html

def page_parser(data):

    # use standard python html parser and bs4
    soup = BeautifulSoup(retrieve_html(BASE_URL + data['link']), 'html.parser')
    
    # find data from movie page modify it and store it in a dictionary
    data['runtime'] = soup.find('time', attrs={'itemprop': 'duration'})\
    ['datetime'][2:-1]    
    
    # get the genres
    data['genre'] = []
    for el in soup.find('div', 'subtext').find_all('span', 'itemprop'):
        data['genre'].append(el.string.strip())
    data['genre'] = ';'.join(data['genre'])

    # find writers
    data['writer'] = []
    for el in soup('span', attrs={'itemprop': 'creator', 'itemtype':\
     'http://schema.org/Person'}):
        data['writer'].append(el.find('a').string.strip())
    data['writer'] = ';'.join(data['writer'])

    # find directors
    data['director'] = []
    for el in soup('span', attrs={'itemprop': 'director'}):
        data['director'].append(el.find('a').string.strip())
    data['director'] = ';'.join(data['director'])

    # find actors
    data['actor'] = []
    for el in soup('span', attrs={'itemprop': 'actors'})[:3]:
        data['actor'].append(el.find('span').string.strip())
    data['actor'] = ';'.join(data['actor'])

    # get the rating from the soup
    rating_string = soup.find('div', class_='ratingValue').find('strong')\
    ['title']

    # first three chars are the actual rating
    data['rating'] = rating_string[:3]

    # regular expression used to remove all non-digits from place 3 onwards
    # this is needed for the amount of voters as it is obscured by non-digits
    data['voters'] = re.sub('[^0-9]', '', rating_string[3:])

    # all the data has been collected
    return data

# main function
if __name__ == '__main__':

    # get soup for imdb top 250 page
    soup = BeautifulSoup(retrieve_html(TARGET_URL), 'html.parser')
    
    # write first line in csv file
    with open(OUTPUT_CSV, 'w') as output_file:
        writer = csv.writer(output_file)
        writer.writerow(['Title', 'Runtime', 'Genre(s)', 'Director(s)', 'Writer(s)', 'Actor(s)', 'Rating', 'Number of ratings'])
    
    # iterate over all movies in the top 250
    for i, movie in enumerate(soup('td', 'titleColumn')):
        data = {}
        data['title'] = movie.a.string
        
        # link is stored and individual page is parsed
        data['link'] = movie.a.get('href')
        data = page_parser(data)
        
        # give an indication of the progress, as it might take a long time
        print('Current entry: {} {}'.format(i + 1, data['title']))
        
        # write the data to the csv file
        with open(OUTPUT_CSV, 'a') as output_file:
            writer = csv.writer(output_file)
            writer.writerow([data['title'], data['runtime'], data['genre'],\
                data['director'], data['writer'], data['actor'], \
                data['rating'], data['voters']])