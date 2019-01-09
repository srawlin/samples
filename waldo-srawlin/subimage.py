#
# Waldo Photos Engineering Project
#
# By Steve Rawlinson
#
# The application takes the location of two image files and returns
# information if one of the images is a cropped part of the other one
#
#
# Assumptions:
# - if cropped image appears more than once, the "best" match is returned
# - two images can fit into memory
#

import argparse
import os
import sys

from celery import group
from waldo_worker.tasks import run_match


if __name__ == "__main__":

    # Parse command line arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("image1", help="path of first image")
    parser.add_argument("image2", help="path of second image")
    args = parser.parse_args()

    for filename in [args.image1, args.image2]:
        if not os.path.isfile(filename):
            print('File not found: {0}'.format(filename))
            sys.exit(1)

    # Celery worker to perform match
    g = group(run_match.s(args.image1, args.image2),
              run_match.s(args.image2, args.image1))
    result = g().get()

    if len(result) != 2:
        print('Run failed.  Expected 2 results from Celery worker but'
              'got {0}'.format(result))

    # Output results
    no_matches = True
    for match in result:
        if match[1]:
            print('{0} cropped image at {1} (top-left corner)'.format(
                match[0], match[1]))
            no_matches = False

    if no_matches:
        print('No matches')
