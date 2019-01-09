import cv2
import logging
import os
import numpy as np

from errno import ENOENT
# from matplotlib import pyplot as plt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# use DEBUG = True to display image and cropped area in matplotlib
DEBUG = False


class WaldoImage:

    def __init__(self, image_filename):
        """Load the image using OpenCV. Check if it exists and is valid image"""

        if not os.path.isfile(image_filename):
            logger.error('File not found: {0}'.format(image_filename))
            raise IOError(ENOENT, 'File not found', image_filename)

        self.image = cv2.imread(image_filename, 0)

        if not isinstance(self.image, np.ndarray):
            logger.error('Invalid image file: {0}'.format(image_filename))
            raise ValueError('Invalid image file')

    @property
    def dimensions(self):
        """ Returns image (width, height)"""
        return self.image.shape[::-1]

    def match(self, template, threshold=0.7, method=cv2.TM_CCOEFF_NORMED):
        """
        Possible methods for comparison
        ['cv2.TM_CCOEFF', 'cv2.TM_CCOEFF_NORMED', 'cv2.TM_CCORR',
         'cv2.TM_CCORR_NORMED', 'cv2.TM_SQDIFF', 'cv2.TM_SQDIFF_NORMED']

        Based on OpenCV tutorial
        https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_template_matching/py_template_matching.html
        """

        template_w, template_h = template.dimensions
        image_w, image_h = self.dimensions

        # size check, can not contain template if any dimension is smaller
        if template_w > image_w or template_h > image_h:
            return None

        # Apply template Matching
        res = cv2.matchTemplate(self.image, template.image, method)
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

        logger.info('threshold min %f max %f', min_val, max_val)

        if max_val < threshold:
            return None

        # If the method is TM_SQDIFF or TM_SQDIFF_NORMED, take minimum
        if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
            top_left = min_loc
        else:
            top_left = max_loc

        if DEBUG:
            self.plot_detection(res, top_left, template_w, template_h)

        return top_left

    def plot_detection(self, res, top_left, width, height):
        """Display image and cropped rectangle using matplotlib"""

        bottom_right = (top_left[0] + width, top_left[1] + height)

        cv2.rectangle(self.image, top_left, bottom_right, 255, 2)

        plt.subplot(121), plt.imshow(res, cmap='gray')
        plt.title('Matching Result'), plt.xticks([]), plt.yticks([])
        plt.subplot(122), plt.imshow(self.image, cmap='gray')
        plt.title('Detected Point'), plt.xticks([]), plt.yticks([])

        plt.show()
