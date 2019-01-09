from django.test import TestCase
from portfolio.models import *

class HoldingsViewTests(TestCase):

    def setUp(self):
        self.u1 = User.objects.create(username='user1')
        # self.up1 = UserProfile.objects.create(user=self.u1, balance=100000.0)

    def test_create_a_stock(self):
    	stock = Holdings(owner=self.u1, symbol='GOOG', company_name="Google Inc.", quantity=1, price_paid = 555.50)
        stock.save()
        
        new_stock = Holdings.objects.get(owner=self.u1, symbol='GOOG')
        self.assertEqual(str(new_stock), 'user1 GOOG 1')

	def test_buy_new_stock(self):
		""" check balance """
		
		pass
		
	def test_buy_existing_stock(self):
		pass
		
	def test_sell_stock(self):
		""" check balance update, quantity changed"""
		pass
		
	def test_sell_stocks_now_none_left(self):
		""" make sure removed from portfolio """
		pass
		
	def test_sell_stock_do_not_own(self):
		pass
		
	def test_buy_negative_stocks(self):
		pass
		
	def test_sell_negative_stocks(self):
		pass
		
	def lookup_valid_symbol(self):
		pass
	
	def lookup_invalid_symbol(self):
		pass

    def tearDown(self):
        self.u1.delete()