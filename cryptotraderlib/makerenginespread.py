# Written By Steve Rawlinson
# Copyright 2014
#
# A market maker for cryptocurrency exchanges.
# Profits from the spread in the order book.

import time
import numpy
import datetime
import argparse
import csv
import math
import talib
import pylab

import bittrexfetch
import exchangebittrex



ACCOUNTS = {'you@example.com' : {'API': 'YOUR API KEY', 'SECRET': 'YOUR SECRET KEY' },}

QUANTITY_RATIO = 4.0

ORDERBOOK_THRESHOLD_BTC = 0.00009  # ignore orders less than this value

class MakerEngine:
	exchange = None
	exchange_name = ''
	symbol = None
	start_time = None
	start_balance_btc = None
	start_balance_symbol = None
	start_portfolio_value_btc = 0.0
	exchange_rate_avg = None
	last_price = None
	min_trade_size = 0.0
	
	balance_btc = None
	balance_symbol = None
	
	state = None # in, out

	def __init__(self, exchange, symbol, api_key, lookback):
		self.symbol = symbol
		self.start_time = datetime.datetime.now()
		self.exchange_name = exchange
		self.lookback = lookback
		
		if exchange == 'bittrex':
			self.exchange = exchangebittrex.ExchangeBittrex(api_key['API'], api_key['SECRET'])
		elif exchange == 'poloniex':
			pass
		else:
			print "Error, unknown exchange"
	
		# check that exchange supports symbol
		
		self.start_balance_btc = self.exchange.get_balance('BTC')
		self.start_balance_symbol = self.exchange.get_balance(symbol)
		
		self.balance_btc = self.start_balance_btc
		self.balance_symbol = self.start_balance_symbol
		
		self.exchange_rate_avg = self.exchange.get_market_history(self.symbol)[0]['Price']
		self.last_price = self.exchange_rate_avg
		self.start_portfolio_value_btc = self.start_balance_btc + (self.start_balance_symbol* self.exchange_rate_avg)
		
		print "Initial portfolio value:", self.start_portfolio_value_btc, "BTC"
		print " - BTC", self.balance_btc, "BTC"
		print " -", symbol, self.balance_symbol, "or", (self.balance_symbol * self.exchange_rate_avg), "(BTC)"
		print

		# get min trade size
		summary = bittrexfetch.get_bittrex_summary()
		for market in summary:
			if (market['BaseCurrency'] == 'BTC') and (market['MarketCurrency'] == symbol):
				self.min_trade_size = market['MinTradeSize']
				# print "min_trade_size", self.min_trade_size
		
		
	def stop(self):
		# close all orders
		self.exchange.cancel_all_orders(self.symbol)
		time.sleep(10)
		
		# sell all holdings
		balance_symbol = self.exchange.get_balance(self.symbol)
		order_book = self.exchange.get_order_book(self.symbol)
		self.exchange.sell(self.symbol, balance_symbol, order_book['buy'][0]['Rate'])  # improve so all coins are sold
		
		print "MarketEngine stopped for", self.exchange_name, self.symbol
		
	def print_state(self):
		# print out the current state, profit etc,
		# balance_symbol = self.exchange.get_balance(self.symbol)
		# balance_btc = self.exchange.get_balance('BTC')
		
		balance_symbol_btc = self.balance_symbol * self.last_price
		portfolio_value_btc = balance_symbol_btc + self.balance_btc
		
		print datetime.datetime.now(), "BTC:", self.balance_btc, ",", self.symbol, ":", self.balance_symbol, (self.balance_symbol* self.exchange_rate_avg), "(BTC). Profit: ", portfolio_value_btc - self.start_portfolio_value_btc, "BTC"


	def we_are_first(self, order_book_partial, order, order_type):
		# check that we are first
		if order['rate'] and order['orderid'] and (order_book_partial[0]['Rate'] == order['rate']):  # and quantity is equal or less
			# check that second is close, otherwise we are not optimal and should create new order
			if (order_type == 'buy') and (order['rate'] - order_book_partial[1]['Rate'] < 0.00000005):
				return True
			if (order_type == 'sell') and (order_book_partial[1]['Rate'] - order['rate'] < 0.00000005):
				return True
		return False

	def clean_order_book(self, order_book):
		clean_order_book = {'sell':[], 'buy':[]}

		for s in order_book['sell']:
			if s['Quantity'] > ORDERBOOK_THRESHOLD_BTC/self.exchange_rate_avg:
				clean_order_book['sell'].append(s)

		for b in order_book['buy']:
			if b['Quantity'] > ORDERBOOK_THRESHOLD_BTC/self.exchange_rate_avg:
				clean_order_book['buy'].append(b)		
				
		return clean_order_book		

	def update_balances(self):
		self.balance_symbol = self.exchange.get_balance(self.symbol)
		self.balance_btc = self.exchange.get_balance('BTC')

	def get_state_old(self):
		self.update_balances()
		
		count = 15
		my_orders = self.exchange.get_order_history(self.symbol, count)
		if len(my_orders) == 0:
			self.state = 'out'
			return
	
		for order in my_orders:
			if order['QuantityRemaining'] == 0.0:
				if order['OrderType'] == 'LIMIT_BUY':
					self.state = 'in'
					return
				elif order['OrderType'] == 'LIMIT_SELL':
					self.state = 'out'
					return
		
		if len(my_orders) < count:
			self.state = 'out'
			return
		
		print "Error, unknown last order type.  Current state is unknown.  Try increasing count."	

	def calc_signals(self, tvdata, history):
		# print "calc_signal, history", history[-1]['Price']
		tvdata['c'].append(history[0]['Price'])

		try:
			y = int(math.log10(tvdata['c'][-1]))
		except:
			y = 0
		factor = math.pow(10, -y)
		close = numpy.array(tvdata['c']) * factor

		# upper, middle, lower = talib.BBANDS(close, timeperiod=self.lookback, nbdevup=0.54, nbdevdn=0.54, matype=0)
		upper, middle, lower = talib.BBANDS(close, timeperiod=self.lookback, nbdevup=0.25, nbdevdn=0.25, matype=0)
		
		if False:
			pylab.plot(close)
			pylab.plot(upper)
			pylab.plot(lower)
			pylab.plot(middle)
			pylab.show()
		
		buy_signal = False
		sell_signal = False	
		
		# print "calc_signal current_buy_for_me", current_buy_price, "current_sell_for_me", current_sell_price, "lower", lower[-1], "upper", upper[-1]
		# print "calc_signal close", close[-1], "lower", lower[-1], "upper", upper[-1], "middle", middle[-1]
		if (self.balance_btc > 0.0) and (close[-1] < lower[-1]):
			print "  ** Buy Signal ** calc_signal close", close[-1], "lower", lower[-1], "upper", upper[-1], "middle", middle[-1]
			buy_signal = True
		else:
			print "  calc_signal close", close[-1], "lower", lower[-1], "upper", upper[-1], "middle", middle[-1]
		
		# if (self.balance_symbol > 0.0) and (close[-1] > upper[-1]):
		# 	print "  ** Sell Signal ** calc_signal close", close[-1], "lower", lower[-1], "upper", upper[-1], "middle", middle[-1]
		if (self.balance_symbol >= self.min_trade_size):
			sell_signal = True
			
		# if (not buy_signal) and (not sell_signal):
		#	print "  calc_signal close", close[-1], "lower", lower[-1], "upper", upper[-1], "middle", middle[-1]
		
		return (buy_signal, sell_signal)
	
	def calc_new_orders(self, history, order_book):
		# calculate mean and variance
		prices = [p['Price'] for p in history[:10]] # last 10 
		average = numpy.average(prices)  # could include weight for more recent
		self.exchange_rate_avg = average
		# std = numpy.std(prices)
		
		# spread
		buy_max = order_book['buy'][0]['Rate']
		sell_min = order_book['sell'][0]['Rate']
		spread = sell_min - buy_max
		# print "spread", spread, sell_min, buy_max
		
		# check if too risky
		# also check if average is in the spread
		#if (average <= buy_max) or (average >= sell_min) or (std >= abs(spread * 2)):
		#	print "Risk too high:"
		#	print " - average <= buy_max", average <= buy_max
		#	print " - average >= sell_min", average >= sell_min
		#	print " - std >= spread", std >= spread, std, abs(spread*2.0)
		
		# use std and transaction rate to determine spread.

		buy_order = {'rate': buy_max + 0.00000001}
		sell_order = {'rate': sell_min - 0.00000001}

		# buy_order = {'rate': buy_max}
		# sell_order = {'rate': sell_min}
		
		return (buy_order, sell_order)

	def too_risky(self, order_book):
		# spread
		buy_max = order_book['buy'][0]['Rate']
		sell_min = order_book['sell'][0]['Rate']
		spread = sell_min - buy_max		
		if (spread / buy_max) < 0.03:   # spread less than 3% is too risky
			print "  Buying is too Risky.  Spread is:", (spread / buy_max) * 100
			return True
		return False
			
	def run(self):
		previous_history = None
		previous_order_book = None
		previous_our_orders = None
		
		buy_order = {'rate': None, 'orderid': None}
		sell_order = {'rate': None, 'orderid': None}
		
		# self.exchange.cancel_all_orders(self.symbol)  # risky?
		# time.sleep(5)
		
		while(True):
			self.update_balances()
			
			# get market info
			history = self.exchange.get_market_history(self.symbol)
			order_book = self.exchange.get_order_book(self.symbol) # this order book might include our orders
			if history and order_book:
				clean_order_book = self.clean_order_book(order_book)
				
				balance_symbol_btc = self.balance_symbol * self.exchange_rate_avg
				portfolio_value_btc = balance_symbol_btc + self.balance_btc
				
				# calculate signals
				tvdata = bittrexfetch.get_bittrex_market(self.symbol, resolution_min = 1, from_timestamp=None, to_timestamp=None, reload=True)
				(buy_signal, sell_signal) = self.calc_signals(tvdata, history)

				if self.too_risky(self.clean_order_book(order_book)):
					# cancel all open buy orders
					if buy_order['orderid']:
						self.exchange.cancel_order(buy_order['orderid'])
						print "  cancel buy orders"
						buy_order['orderid'] = None
						
					# supress buy_signal, allow selling when risky to exit position
					buy_signal = False
					
				# --buy-- check if we're still in first position
				if buy_signal and (not self.we_are_first(clean_order_book['buy'], buy_order, 'buy')):
					self.print_state()
	
					# cancel orders
					if buy_order['orderid']:
						self.exchange.cancel_order(buy_order['orderid'])
						print "  cancel buy orders"
						buy_order['orderid'] = None
						time.sleep(3)
						order_book = self.exchange.get_order_book(self.symbol) # this order book might include our orders
						clean_order_book = self.clean_order_book(order_book)
						# wait?
	
					# calculate new positions
					(new_buy_order, new_sell_order) = self.calc_new_orders(history, clean_order_book)
					
					# place new orders, adjust quantity if more than one order
					if new_buy_order:
						# print "buy_quantity", (portfolio_value_btc/QUANTITY_RATIO )/new_buy_order['rate']
						# print self.balance_btc/new_buy_order['rate']
						buy_quantity = min((portfolio_value_btc/QUANTITY_RATIO )/new_buy_order['rate'], (self.balance_btc - 1.0e-8)/new_buy_order['rate'])
						buy_quantity = buy_quantity * 0.9973
						if buy_quantity > ORDERBOOK_THRESHOLD_BTC/self.exchange_rate_avg:
							print "  New Buy Order", self.symbol, buy_quantity, new_buy_order['rate']
							orderid = self.exchange.buy(self.symbol, buy_quantity, new_buy_order['rate'])
							if orderid:
								new_buy_order['orderid'] = orderid		
								buy_order = new_buy_order
								time.sleep(3)
					else:
						buy_order = {'rate': None, 'orderid': None}
	
				# -- sell --
				if sell_signal and (not self.we_are_first(clean_order_book['sell'], sell_order, 'sell')):
					self.print_state()
					# cancel orders
					if sell_order['orderid']:
						self.exchange.cancel_order(sell_order['orderid'])
						print "  cancel sell orders"
						sell_order['orderid'] = None
						time.sleep(3)
						order_book = self.exchange.get_order_book(self.symbol) # this order book might include our orders
						clean_order_book = self.clean_order_book(order_book)
	
					# calculate new positions
					(new_buy_order, new_sell_order) = self.calc_new_orders(history, clean_order_book)
					
					# place new orders, adjust quantity if more than one order
					if new_sell_order:
						sell_quantity = self.balance_symbol * 0.9973
						if sell_quantity > ORDERBOOK_THRESHOLD_BTC/self.exchange_rate_avg:
							print "  New Sell Order", self.symbol, sell_quantity, new_sell_order['rate']
							orderid = self.exchange.sell(self.symbol, sell_quantity, new_sell_order['rate'])
							if orderid:
								new_sell_order['orderid'] = orderid		
								sell_order = new_sell_order
								time.sleep(3)
					else:
						sell_order = {'rate': None, 'orderid': None}
					
			time.sleep(1)
			# break
		
if __name__ == "__main__":
	parser = argparse.ArgumentParser(description='Market Maker')
	parser.add_argument('account', help='email address of account to use')
	parser.add_argument('exchange', help='exchange, default bittrex')
	parser.add_argument('symbol', help='market symbol')

	args = parser.parse_args()
	
	# get lookback from halflife
	lookback = 0
	hurst = 0.0
	with open('/Users/srawlin/MyFiles/biz/crypto-trading/devel/meanrev/halflife-hurst.csv', 'rb') as csvfile:
		reader = csv.DictReader(csvfile, delimiter=',')
		for row in reader:
			if row['Symbol'] == args.symbol:
				lookback = int(float(row['Halflife']))
				hurst = float(row['Hurst'])
				
	if hurst > 0.35:
		print "Warning: hurst expontent is > 0.35 with value of", hurst
	
	if (lookback > 5) and (lookback < 3000):
		engine = MakerEngine(args.exchange, args.symbol, ACCOUNTS[args.account], lookback)
	else:
		print "Error:  Invalid or missing lookback", lookback
		
	start_time = datetime.datetime.now()
	
	try:
		engine.run()
	except (KeyboardInterrupt, SystemExit):
		print "User stopped engine."
	except Exception, e:
		print "Unexpected error"
		raise e
	finally:
		engine.print_state()
		print
		print "Stopping engine.  Closing orders and selling position. (Check that order sells!)"
		end_time = datetime.datetime.now()
		print "Ended at", datetime.datetime.now()
		print "Run time", str(end_time - start_time)
		# engine.stop()