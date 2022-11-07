import paho.mqtt.client as mqtt
import time
import random

destination1 = "/capteur/temp"
destination2 = "/capteur/humid"

def generateTemp():
    v = random.random()*60-10
    print("Température :", v)
    return v

def generateHumid():
    v = random.random()*90+5
    print("Humidité :", v)
    return v

client = mqtt.Client()
client.connect("localhost", 1883, 10)
client.loop_start()
while 1:
    client.publish(destination1, generateTemp())
    time.sleep(0.5)
    client.publish(destination2, generateHumid())
    time.sleep(0.5)


