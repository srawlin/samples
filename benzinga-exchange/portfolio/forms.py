from django import forms

class OrderForm(forms.Form):
    symbol = forms.CharField()
    quantity = forms.IntegerField(min_value=1)
    order_type = forms.CharField()
