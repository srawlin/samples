from __future__ import absolute_import, unicode_literals
from celery import Celery

app = Celery('waldo_worker',
             backend='rpc://',
             broker='amqp://srawlin:narnia@localhost:5672/waldo',
             include=['waldo_worker.tasks'])

# Optional configuration, see the application user guide.
app.conf.update(
    result_expires=3600,
)

if __name__ == '__main__':
    app.start()
