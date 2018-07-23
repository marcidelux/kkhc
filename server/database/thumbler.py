#!/usr/bin/python3.5

import os
from PIL import Image

img_exts = ['.jpg', 'jpeg', '.png']

image_dir = '/home/miki/Documents/kkhc/data/test_images'

for path_, directories, files in os.walk(image_dir):
    for filename in files:
        fullname = os.path.join(path_, filename)
        basename, file_extension = os.path.splitext(fullname)
        thumb_file = basename + '_thumb.jpg'
        if ((file_extension in img_exts) and not (basename[-6:] == '_thumb')):
            if not os.path.isfile(thumb_file):
                print('Creating ->', thumb_file)
                try:			
                    im = Image.open(fullname)
                    rgb_im = im.convert('RGB')
                    rgb_im.thumbnail((128, 128), Image.ANTIALIAS)
                    rgb_im.save(thumb_file)
                except IOError:
                    print ('Cannot create thumbnail for', fullname)
