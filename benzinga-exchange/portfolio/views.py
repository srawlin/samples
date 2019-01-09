# Benzinga Exchange Code Challenge
# Written by Steve Rawlinson
# September 3, 2014

from django import forms
from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login

from portfolio.models import Holdings
from portfolio.forms import OrderForm

import urllib2
import json
from decimal import *

# === User Management ===
def register(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			new_user = form.save()

			# new_user = authenticate(username=request.POST['username'],
            #                         password=request.POST.get('password', ''))
			# login(request, new_user)
			return HttpResponseRedirect("/portfolio/")
	else:
		form = UserCreationForm()
	return render(request, "registration/register.html", {
        'form': form,
    })


def logout_view_old(request):
    logout(request)
    return HttpResponseRedirect("/accounts/login")


def index(request):
	# get portfolio values after any orders placed
	if request.user.is_authenticated():
		# Do something for authenticated users.
		stock_list = None
		if request.user:
			stock_list = Holdings.objects.filter(owner=request.user)
		return render(request, 'portfolio/exchange.html', {'stock_list': stock_list})
	
	return HttpResponseRedirect("/portfolio/register")


# === Helper Functions ===
def get_symbol(symbol):
	# lookup that symbol with Benzinga API
	response = urllib2.urlopen('http://data.benzinga.com/stock/' + symbol)
	data = json.load(response)
	
	if data.has_key('status') and data['status'] == 'error':
		return None
		
	return data


@login_required
def place_order(request, symbol, order_type, quantity):
	user = request.user.userprofile	
    	
	try:
		data = get_symbol(symbol)
	except:
		# Redisplay the question voting form.
		return (False, "Unknown symbol")
	else:
		bid_price = Decimal(data['bid'])
		ask_price = Decimal(data['ask'])

		if order_type == 'buy':
			# check balance
			if user.balance >= (quantity * ask_price):
				# check if user already owns stock
				try:
					stock= Holdings.objects.get(owner=request.user, symbol=symbol)
					stock.quantity = stock.quantity + quantity
					stock.price_paid = ask_price  # *** TODO *** This is incorrect, should it be a weighted average?
					stock.save()
				except Holdings.DoesNotExist:
					stock = Holdings(owner=request.user, symbol=symbol, company_name=data['name'], quantity=quantity, price_paid = ask_price)
					stock.save()

				user.balance = user.balance - (quantity * ask_price)				
				user.save()
			else:
				return (False, "Insufficent funds.")
        
		elif order_type == 'sell':
			# check quantity to sell
			try:
				user_stock = Holdings.objects.get(owner=request.user, symbol=symbol)
			except:
				return (False, "You do not own any of that stock to sell.")
			if (user_stock.quantity >= quantity):
				user_stock.quantity = user_stock.quantity - quantity
				user_stock.save()
				if user_stock.quantity == 0:
					user_stock.delete()

				user.balance = user.balance + (quantity * bid_price)
				user.save()
			else:
				return (False, "You do not own that many stocks to sell.")
				
        return (True, "Order placed successfully.")


# == Application View Functions ===
@login_required
def exchange(request, symbol):
	flash_message = None
	company_name = None
	bid_price = None
	ask_price = None
	valid_symbol = False
	
	data = get_symbol(symbol)
	if data:
		company_name = data['name']
		bid_price = float(data['bid'])
		ask_price = float(data['ask'])
		valid_symbol = True

	if request.method == 'POST':
		form = OrderForm(request.POST)
		if form.is_valid():
			cd = form.cleaned_data
			(success, flash_message) = place_order(
            	request,
                cd['symbol'],
                cd['order_type'],
                int(cd['quantity']),
            )
			if success:
				return HttpResponseRedirect(reverse('exchange', args=(symbol,)))			
	else:
		form = OrderForm(
			initial={'symbol': symbol}
		)
	
	# get portfolio values after any orders placed
	stock_list = None
	if request.user.is_authenticated():
		stock_list = Holdings.objects.filter(owner=request.user)

	return render(request, 'portfolio/exchange.html', {'symbol': symbol, 'company_name': company_name, 'bid_price': bid_price, 'ask_price': ask_price,
							'stock_list': stock_list, 'form': form, 'flash_message': flash_message, 'valid_symbol': valid_symbol })

