
from tqdm import tqdm
import tensorflow as tf
from keras.applications.resnet50 import ResNet50
from keras.layers import Flatten, Input
from keras.models import Model
from keras.preprocessing import image
from keras.applications.imagenet_utils import preprocess_input
import numpy as np
import time

TEST_DATA_PATH = 'C:\\Users\\benza-ord\\source\\repos\\cifar-10-batches-py\\'


start = time.time()


def unpickle(file):
    import pickle
    with open(file, 'rb') as fo:
        dict = pickle.load(fo, encoding='bytes')
    return dict


data = unpickle(TEST_DATA_PATH+'test_batch')
print(data)