import bittrexapiv11
from exchangebase import ExchangeBase

class ExchangeBittrex(ExchangeBase):
	
	def __init__(self, APIKey, Secret):
		self.APIKey = APIKey
		self.Secret = Secret
		
		self.api = bittrexapiv11.bittrex(self.APIKey, self.Secret)
		
	def cancel_order(self, orderid):
		response = self.api.cancel(orderid)
		if not response['success']:
			print "Error: unable to cancel order", orderid
			print response['message']
			return False
		return True
		
	def buy(self, symbol, quantity, rate):
		# returns the order ID
		response = self.api.buy_limit('BTC-'+symbol, quantity=quantity, rate=rate)
		if response['success']:
			return  response['result']['uuid']
		else:
			print "Error: unable to buy", symbol
			print response['message']
			return None
		
	def sell(self, symbol, quantity, rate):
		# returns the order ID
		response = self.api.sell_limit('BTC-'+symbol, quantity=quantity, rate=rate)
		if response['success']:
			return  response['result']['uuid']
		else:
			print "Error: unable to sell", symbol
			print response['message']
			return None
		
	def get_open_orders(self, symbol):
		response = self.api.get_open_orders('BTC-'+symbol)
		if not response['success']:
			print "Error: unable to open order list for", symbol
			print response['message']

		open_orders = []
		for order in response['result']:
			open_orders.append(order['OrderUuid'])
			
		return open_orders

	def get_balance(self, symbol):
		response = self.api.get_balance(symbol)
		
		if not response['success']:
			print "Error: unable to get balance for", symbol
			print response['message']
		
		if response['result'] is None:
			return 0.0
			
		return response['result']['Balance']

	def get_market_history(self, symbol, count=20):
		response = self.api.get_market_history('BTC-'+symbol, count=20)
		if not response['success']:
			print "Error: unable to get market_history for", symbol
			print response['message']
			
		return response['result']
		
	def get_order_book(self, symbol):
		response = self.api.get_orderbook('BTC-'+symbol, 'both', depth=20)
		if not response['success']:
			print "Error: unable to get order book for", symbol
			print response['message']
			
		return response['result']
		
	def get_order_history(self, symbol, count=1):
		response = self.api.get_order_history('BTC-'+symbol, count=count)
		if not response['success']:
			print "Error: unable to get your order history for", symbol
			print response['message']
			
		return response['result']