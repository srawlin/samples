# Waldo Photos Engineering Project
> 

Demonstration application that finds cropped images.

## Installation

The application is written in Python 3.6.  For parallel processing it uses Celery with a RabbitMQ message broker.

OS X & Linux:

```bash
pip install opencv-python celery matplotlib
```

### Start Celery Workers

In a seperate shell start the Celery workers.

```bash
celery -A waldo_worker worker -l info
```

### Install Broker

Install and configure a broker, such as RabbitMQ.  [Celery RabbitMQ](http://docs.celeryproject.org/en/latest/getting-started/brokers/rabbitmq.html#broker-rabbitmq)

Edit broker settings in `waldo_worker/celery.py`


## Usage example

The application takes the location of two image files

Example:
```bash
python subimage.py ./test-images/image1.jpg ./test-images/image1_cropped.jpg 
```



## Run Tests

```bash
python -m unittest tests/test_waldo_image.py
```

## Assumption

I've made the following assumptions:

* two images can fit into the memory of a Celery worker at the same time
* if cropped image appears more than once, the "best" match is returned


## Meta

Steve Rawlinson – srawlin@gmail.com

Credit:
Template Matching based on [OpenCV Tutorial](https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_imgproc/py_template_matching/py_template_matching.html)

[https://github.com/srawlin](https://github.com/srawlin/)

