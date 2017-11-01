#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Name: Sebastiaan Arendsen
# Student number: 6060072
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''

import csv

from pattern.web import URL, DOM, Element

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT

    # create an empty list
    rv = []

    # div: lister-item mode-advanced is tje entry for a series
    for el in dom('div.lister-item.mode-advanced'):
        
        # create an empty dictionary to store data
        data = {}

        #  title and rating are relatively clean
        data['title'] = el('h3 > a')[0].content.encode('utf8')
        data['rating'] = el('div strong')[0].content.encode('utf8')
        
        # genre had some trailing and leading whitespace
        data['genre'] = el('span.genre')[0].content.strip().encode('utf8')

        # actors are multiple 
        #actors = []
        #for actor in el('p a'):
        #    actors.append(actor.content.encode('utf8'))

        data['actors'] = ', '.join(el('p a').content)
        data['runtime'] = el('span.runtime')[0].content.rstrip('min').encode('utf8')
        rv.append(data)

    return rv


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])
    for serie in tvseries:
        writer.writerow([serie['title'], serie['rating'], serie['genre'], \
            serie['actors'], serie['runtime']])

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)
    print tvseries

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
