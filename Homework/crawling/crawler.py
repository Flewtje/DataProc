from bs4 import BeautifulSoup
import urllib.request
import csv
import os


TARGET_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

soup = BeautifulSoup(html, 'html.parser')
html = urllib.request.urlopen(TARGET_URL).read()

