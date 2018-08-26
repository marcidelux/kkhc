#!/usr/bin/python3.5

import os
import operator
import sys

if len(sys.argv) < 2 :
  print('Usage : stats.py path')
  sys.exit(1)
else :
  search_path = sys.argv[1]

if not os.path.isdir(search_path):
    print('Usage : thumbler.py path')
    sys.exit(1)  

stat = {}

def statistics(ext):
    if ext in stat:
        stat[ext] += 1
    else:
        stat[ext] = 1

def pretty(my_dict):
    exts = []
    for key, value in my_dict.items():
        exts.append({'extension': key, 'occurance': value})
    sorted_exts = sorted(exts, key=operator.itemgetter('occurance'), reverse=True)
    for ext in sorted_exts:
        print(" %s : %s" % (ext['extension'], ext['occurance']))

for path_, directories, files in os.walk(search_path):
    for filename in files:
        fullname = os.path.join(path_, filename)
        basename, file_extension = os.path.splitext(fullname)        
        statistics(file_extension)

pretty(stat)