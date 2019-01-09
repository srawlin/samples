from twython import Twython
from twython import TwythonStreamer
import re
import time
import datetime

APP_KEY = 'YOUR KEY HERE'
APP_SECRET = 'YOUR SECRET HERE'

ACCESS_TOKEN_SECRET = 'GENERATE YOUR OAUTH TOKEN AND PUT IT HERE'
ACCESS_TOKEN = 'GENERATE YOUR OAUTH TOKEN AND PUT IT HERE'

OAUTH_TOKEN = ACCESS_TOKEN
OAUTH_TOKEN_SECRET = ACCESS_TOKEN_SECRET 


def word_cleanup(words):
	""" removes special characters, URLs, repeated characters, digits, etc."""
	cwords = []
	for word in words:
		if ( (len(word) > 5) and 
		     (word[0] != '@') and 
		     (word[0] != '#') and
		     (word[0] != '&') and 
		     (word.find('http') == -1) ):
			word = re.sub('[!@#$\.\?\,\*\|\:\;\"\/\(\)\~\[\]\{\}\']', '', word)
			word = re.sub('[\_\-]', ' ', word)
			word = re.sub(r'(.)\1{2,}', r'\1', word)   # replace 3 or more characters with single
			if (not word.isdigit()):
				cwords.append(word.lower())

	return cwords

def is_english_word(word):
	return word.lower() in english_words



class MyStreamer(TwythonStreamer):
	"""Outputs all non dictionary words in the Twitter stream"""

	output  = open('twitter-words' + time.strftime('%Y%m%d-%H%M%S') + '.txt', 'w')
	# d = enchant.Dict("en_US")
	last_file_rotate_time = datetime.datetime.now()

	def on_success(self, data):
		if 'text' in data:
			status_text = data['text'].encode('ascii', 'ignore')  # .encode('utf-8')
			# print status_text
			words = status_text.split()
			
			words = word_cleanup(words)
			
			# ignore dictionary words
			for word in words:
				# if (not self.d.check(word)):
				if (not is_english_word(word)):
					# print word
					self.output.write(word + ' ')

			# rotate each hour
			elapsed_time = datetime.datetime.now() - self.last_file_rotate_time
			if (elapsed_time > datetime.timedelta(minutes = 60)):
				# print "*** Rotating file ****"
				self.output.close()
				self.output  = open('twitter-words' + time.strftime('%Y%m%d-%H%M%S') + '.txt', 'w')
				self.last_file_rotate_time = datetime.datetime.now()

	def on_error(self, status_code, data):
		print status_code

        # To stop getting the data because of the error
        # self.disconnect()

if __name__ == "__main__":
	twitter = Twython(APP_KEY, APP_SECRET, oauth_version=2)
	access_token = twitter.obtain_access_token()
	
	# initialize English dictionary
	print "Initializing Word Dictionary"
	with open("wlist_match1.txt") as word_file:
		english_words = set(word.strip().lower() for word in word_file)
	
	# add extra words to dictionary to ignore
	with open("ignore-words.txt") as more_word_file:
		english_words.update(set(word.strip().lower() for word in more_word_file))

    stream = MyStreamer(APP_KEY, APP_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET)
    print "Starting Twitter Stream..."
    stream.statuses.sample(language="en")
