#!/usr/bin/python3.5

import os
from PIL import Image

img_exts = ['.jpg', 'jpeg', '.png']

image_dir = '/Users/caladan/WebstormProjects/kkhc/data/test_images'

for path_, directories, files in os.walk(image_dir):
    for filename in files:
        fullname = os.path.join(path_, filename)
        basename, file_extension = os.path.splitext(fullname)
        thumb_file_name = basename + '_thumb.png'
        if ((file_extension in img_exts) and not (basename[-6:] == '_thumb')):
            if not os.path.isfile(thumb_file_name):
                print('Creating ->', basename)
                try:			
                    im = Image.open(fullname)
                    alpha = im.split()[-1]
                    print(alpha.mode)
                    if alpha.mode == 'L':
                        rgba_im = im.convert('RGBA')
                        rgba_im.putalpha(alpha)
                        rgba_im.thumbnail((128, 128), Image.ANTIALIAS)
                        rgba_im.save(thumb_file_name)
                    elif alpha.mode == 'P':
                        rgba_im = im.convert('RGBA')
                        rgba_im.palette = None
                        rgba_im = im.resize((128, 128), Image.LANCZOS)
                        rgba_im = im.convert('P')
                        rgba_im.save(thumb_file_name)
                    else:
                        rgb_im = im.convert('RGB')
                        rgb_im.thumbnail((128, 128), Image.ANTIALIAS)
                        rgb_im.save(thumb_file_name)
                except IOError:
                    print ('Cannot create thumbnail for', fullname)
