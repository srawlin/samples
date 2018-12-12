import os

BASE_DIR = None

from .defaults import *  # NOQA
DEBUG = True  # Remove after we're live

STRIPE_SECRET_KEY = 'NNNNN'  # Live mode key

WEBPACK_LOADER = {
    'DEFAULT': {
        'STATS_FILE': os.path.join(
            BASE_DIR, '..', 'webpack-stats.production.json'
        ),
    }
}
