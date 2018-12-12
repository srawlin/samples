import datetime

class ExchangeBase(object):
	def __init__(self):
		pass
		
	def get_balance(self, symbol):
		print "Warning, get_balance not implemented"
		pass

	def cancel_order(self, orderid):
		print "Warning, cancel_order not implemented"
		return False
		
	def cancel_all_orders(self, symbol):
		open_orders = self.get_open_orders(symbol)
		for order in open_orders:
			result = self.cancel_order(order)
			# print " - cancel", order, result
		
	def buy(self, symbol, quantity, rate):
		print "Warning, buy not implemented"
		return None
		
	def sell(self, symbol, quantity, rate):
		print "Warning, sell not implemented"
		return None
		
	def get_market_history(self, symbol):
		print "Warning, get_market_history not implemented"
		return None

	def get_order_book(self, symbol):
		print "Warning, get_order_book not implemented"
		return None		

