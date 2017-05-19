#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from prompt_toolkit import prompt
from prompt_toolkit.history import FileHistory


def get_bot_reply(text):
  """Send a request to the local bot and gives back the reply

  :text: TODO
  :returns: TODO

  """
  res = requests.post('https://run.recast.ai/ftriquet-track-order', headers={'Content-Type': 'application/json'}, json={'text': text})
  if res.status_code != 200:
    raise RuntimeError('Request failed')
  res.close()
  return res.json()


if __name__ == "__main__":
  while 42:
    user_input = prompt('> ', history=FileHistory('/tmp/.bot_history'))
    try:
      print(get_bot_reply(user_input))
    except RuntimeError as e:
      print(e)
