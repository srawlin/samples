import unittest

from waldo_image import WaldoImage

class TestWaldoImage(unittest.TestCase):

    def setUp(self):
        self.image1 = WaldoImage('test-images/image1.jpg')
        self.image1_cropped = WaldoImage('test-images/image1_cropped.jpg')
        self.image_no_match_small = WaldoImage('test-images/image3.jpg')
        self.image_no_match_large = WaldoImage('test-images/image4.jpg')

    def test_dimensions(self):
        self.assertEqual(self.image1.dimensions, (2448, 3264))

    def test_match_none(self):
        # no cropped image
        self.assertEqual(self.image1.match(self.image_no_match_large), None)

    def test_match_found(self):
        # cropped image correctly found
        self.assertEqual(self.image1.match(self.image1_cropped), (997, 214))

    def test_match_below_threshold(self):
        # false positive with threshold of 0.73
        self.assertEqual(self.image1.match(self.image_no_match_small, threshold=0.7), (1224, 436))
        self.assertEqual(self.image1.match(self.image_no_match_small, threshold=0.8), None)

    def test_corrupt_image_file(self):
        with self.assertRaises(ValueError):
            self.image_corrupt_jpg = WaldoImage('test-images/image5.jpg')

if __name__ == '__main__':
    unittest.main()
